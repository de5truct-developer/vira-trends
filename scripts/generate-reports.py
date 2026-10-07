#!/usr/bin/env python3
"""Regenerate src/data/<niche>-report.ts from csi.v_topic_metrics (GG-724).

Read-only against ClickHouse (SELECT only). Run daily by
vira-trends-reports.service, after CSI's nightly collection + load finishes
(~04:21 UTC), on server vira.

Usage:
    generate-reports.py [--niche all|gourmet|...] [--country all|us|...] [--out-dir DIR]

`--niche all` and `--country all` (both the default) regenerate every niche in
NICHES and every country in COUNTRIES in the same run (one axis by category,
the other by geography — see COUNTRIES for why only some countries have an
entry). A bad niche or country (too few rows, stale/failed query) is skipped
with an error on stderr; everything else in the same run still gets
published. The whole run only exits non-zero if everything failed.

Env (same names as /var/lib/csi/csi-ch-loader/.env, load with
`set -a; . .env; set +a` before running, or export directly):
    CSI_CH_URL        e.g. http://127.0.0.1:8123
    CSI_CH_USER
    CSI_CH_PASSWORD
    CSI_CH_DATABASE   csi

For a single niche, nothing is written and that niche is skipped if its
query fails or returns too few rows, so a bad day never publishes broken
data for that niche.
"""
from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone

import requests

MIN_TOPICS = 5  # fewer rows than this: refuse to publish, something's wrong upstream

TOPICS_QUERY = """
SELECT query_id, query_text, cat_l2, growth, trust, video_num, top_countries,
       win_start, win_end, computed_at
FROM v_topic_metrics
WHERE region = 'global' AND cat_l1 = {cat_l1:String} AND growth_reason = 'ok'
  AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
ORDER BY growth DESC
LIMIT 10
FORMAT TSV
"""

# Country reports (GG-724 geography expansion): top-10 growing topics *in* one country, mixing
# every category (no cat_l1 filter) — a different axis from the per-niche reports above, which
# stay region='global' and filter by category instead.
COUNTRY_TOPICS_QUERY = """
SELECT query_id, query_text, cat_l1, cat_l2, growth, trust, video_num, top_countries,
       win_start, win_end, computed_at
FROM v_topic_metrics
WHERE region = {region:String} AND growth_reason = 'ok'
  AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
ORDER BY growth DESC
LIMIT 10
FORMAT TSV
"""

AUDIENCE_QUERY = """
SELECT age, gender, location
FROM topic_population_dominant
WHERE query_id = {query_id:String}
ORDER BY ts DESC
LIMIT 1
FORMAT TSV
"""

METHODOLOGY_NOTE = (
    "TikTok Creative Center data, collected by Vira's own account via Creative Search Insights. "
    "Growth = 7/14/21-day median vs. prior period, shown only when trust is medium or high. "
    'Video count as reported by TikTok; "not reported" (video_num=0) means TikTok did not report a '
    "count for that topic, not zero competition. Updated daily."
)

COUNTRY_METHODOLOGY_NOTE = (
    "TikTok Creative Center data, collected by Vira's own account via Creative Search Insights, "
    "filtered to this country's own search-demand series (not global demand). Mixes every "
    "category — for a single-category view across all countries, see the niche reports instead. "
    "Growth = 7/14/21-day median vs. prior period, shown only when trust is medium or high. "
    'Video count as reported by TikTok; "not reported" (video_num=0) means TikTok did not report a '
    "count for that topic, not zero competition. Updated daily."
)


@dataclass(frozen=True)
class Niche:
    key: str            # CLI --niche value
    category: str       # display name, e.g. "Gourmet"
    cat_l1: str          # csi.v_topic_metrics.cat_l1 filter value
    export_name: str     # exported TS const, e.g. gourmetReport
    out_file: str        # relative to repo src/data/


NICHES: dict[str, Niche] = {
    "gourmet": Niche(
        key="gourmet",
        category="Gourmet",
        cat_l1="Gourmet",
        export_name="gourmetReport",
        out_file="gourmet-report.ts",
    ),
    "science-technology": Niche(
        key="science-technology",
        category="Science and Technology",
        cat_l1="Science and Technology",
        export_name="scienceTechnologyReport",
        out_file="tiktok-science-technology-report.ts",
    ),
    "fashion": Niche(
        key="fashion",
        category="Fashion",
        cat_l1="Fashion",
        export_name="fashionReport",
        out_file="tiktok-fashion-report.ts",
    ),
    "hobbies": Niche(
        key="hobbies",
        category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        export_name="hobbiesReport",
        out_file="tiktok-hobbies-report.ts",
    ),
    "sports": Niche(
        key="sports",
        category="Sports",
        cat_l1="Sports",
        export_name="sportsReport",
        out_file="tiktok-sports-report.ts",
    ),
    "vehicles": Niche(
        key="vehicles",
        category="Vehicles & Transportation",
        cat_l1="Vehicles & Transportation",
        export_name="vehiclesReport",
        out_file="tiktok-vehicles-report.ts",
    ),
    "household": Niche(
        key="household",
        category="Household",
        cat_l1="Household",
        export_name="householdReport",
        out_file="tiktok-household-report.ts",
    ),
    "tourism": Niche(
        key="tourism",
        category="Tourism",
        cat_l1="Tourism",
        export_name="tourismReport",
        out_file="tiktok-tourism-report.ts",
    ),
    "education": Niche(
        key="education",
        category="Education",
        cat_l1="Education",
        export_name="educationReport",
        out_file="tiktok-education-report.ts",
    ),
    "dance": Niche(
        key="dance",
        category="Dance",
        cat_l1="Dance",
        export_name="danceReport",
        out_file="tiktok-dance-report.ts",
    ),
    "featured-content": Niche(
        key="featured-content",
        category="Featured Content",
        cat_l1="TikTok's Featured Content",
        export_name="featuredContentReport",
        out_file="tiktok-featured-content-report.ts",
    ),
    "workplace": Niche(
        key="workplace",
        category="Workplace",
        cat_l1="Workplace",
        export_name="workplaceReport",
        out_file="tiktok-workplace-report.ts",
    ),
    "local-life": Niche(
        key="local-life",
        category="Local Life",
        cat_l1="Local Life",
        export_name="localLifeReport",
        out_file="tiktok-local-life-report.ts",
    ),
    "acgn": Niche(
        key="acgn",
        category="ACGN (Anime, Comics, Games & Novels)",
        cat_l1="ACGN",
        export_name="acgnReport",
        out_file="tiktok-acgn-report.ts",
    ),
    "science-facts": Niche(
        key="science-facts",
        category="Science Knowledge",
        cat_l1="Science Knowledge",
        export_name="scienceFactsReport",
        out_file="tiktok-science-facts-report.ts",
    ),
    "entertainment": Niche(
        key="entertainment",
        category="Entertainment",
        cat_l1="Entertainment",
        export_name="entertainmentReport",
        out_file="tiktok-entertainment-report.ts",
    ),
    "relationships": Niche(
        key="relationships",
        category="Relationship and Psychology",
        cat_l1="Relationship and Psychology",
        export_name="relationshipsReport",
        out_file="tiktok-relationships-report.ts",
    ),
    "culture": Niche(
        key="culture",
        category="Culture",
        cat_l1="Culture",
        export_name="cultureReport",
        out_file="tiktok-culture-report.ts",
    ),
    "healthcare": Niche(
        key="healthcare",
        category="Healthcare",
        cat_l1="Healthcare",
        export_name="healthcareReport",
        out_file="tiktok-healthcare-report.ts",
    ),
    "parenting": Niche(
        key="parenting",
        category="Nursing and Parenting",
        cat_l1="Nursing and Parenting",
        export_name="parentingReport",
        out_file="tiktok-parenting-report.ts",
    ),
    "finance": Niche(
        key="finance",
        category="Finance and Economics",
        cat_l1="Finance and Economics",
        export_name="financeReport",
        out_file="tiktok-finance-report.ts",
    ),
    "music": Niche(
        key="music",
        category="Music",
        cat_l1="Music",
        export_name="musicReport",
        out_file="tiktok-music-report.ts",
    ),
    "media-accounts": Niche(
        key="media-accounts",
        category="Media Accounts",
        cat_l1="Media Accounts",
        export_name="mediaAccountsReport",
        out_file="tiktok-media-accounts-report.ts",
    ),
    "society": Niche(
        key="society",
        category="Society",
        cat_l1="Society",
        export_name="societyReport",
        out_file="tiktok-society-report.ts",
    ),
}


@dataclass(frozen=True)
class Country:
    key: str            # CLI --country value, e.g. "us"
    name: str            # display name, e.g. "United States"
    code: str            # csi.v_topic_metrics.region filter value, e.g. "US"
    export_name: str     # exported TS const, e.g. usCountryReport
    out_file: str        # relative to repo src/data/


# Curated from a live count of region='<code>' rows passing the same quality filters as the
# niche query above (growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0), run
# against csi.v_topic_metrics on 2026-10-07. Threshold: >=200 such rows, so a day-to-day top 10
# is drawn from a comfortably large pool rather than flickering on a handful of topics. That cut
# kept 18 countries (2276 rows for ID down to 215 for EG) and dropped the rest — including DE at
# 193 rows, just under the line, consistent with DE being a known thinner-series market. See
# Research/2026-10-07 GG-724 TikTok-отчёты по странам.md for the full count-per-region table.
COUNTRIES: dict[str, Country] = {
    "id": Country(key="id", name="Indonesia", code="ID", export_name="idCountryReport", out_file="tiktok-country-id-report.ts"),
    "ph": Country(key="ph", name="Philippines", code="PH", export_name="phCountryReport", out_file="tiktok-country-ph-report.ts"),
    "us": Country(key="us", name="United States", code="US", export_name="usCountryReport", out_file="tiktok-country-us-report.ts"),
    "br": Country(key="br", name="Brazil", code="BR", export_name="brCountryReport", out_file="tiktok-country-br-report.ts"),
    "mx": Country(key="mx", name="Mexico", code="MX", export_name="mxCountryReport", out_file="tiktok-country-mx-report.ts"),
    "gb": Country(key="gb", name="United Kingdom", code="GB", export_name="gbCountryReport", out_file="tiktok-country-gb-report.ts"),
    "vn": Country(key="vn", name="Vietnam", code="VN", export_name="vnCountryReport", out_file="tiktok-country-vn-report.ts"),
    "my": Country(key="my", name="Malaysia", code="MY", export_name="myCountryReport", out_file="tiktok-country-my-report.ts"),
    "bd": Country(key="bd", name="Bangladesh", code="BD", export_name="bdCountryReport", out_file="tiktok-country-bd-report.ts"),
    "pk": Country(key="pk", name="Pakistan", code="PK", export_name="pkCountryReport", out_file="tiktok-country-pk-report.ts"),
    "ca": Country(key="ca", name="Canada", code="CA", export_name="caCountryReport", out_file="tiktok-country-ca-report.ts"),
    "ng": Country(key="ng", name="Nigeria", code="NG", export_name="ngCountryReport", out_file="tiktok-country-ng-report.ts"),
    "mm": Country(key="mm", name="Myanmar", code="MM", export_name="mmCountryReport", out_file="tiktok-country-mm-report.ts"),
    "za": Country(key="za", name="South Africa", code="ZA", export_name="zaCountryReport", out_file="tiktok-country-za-report.ts"),
    "au": Country(key="au", name="Australia", code="AU", export_name="auCountryReport", out_file="tiktok-country-au-report.ts"),
    "sa": Country(key="sa", name="Saudi Arabia", code="SA", export_name="saCountryReport", out_file="tiktok-country-sa-report.ts"),
    "th": Country(key="th", name="Thailand", code="TH", export_name="thCountryReport", out_file="tiktok-country-th-report.ts"),
    "eg": Country(key="eg", name="Egypt", code="EG", export_name="egCountryReport", out_file="tiktok-country-eg-report.ts"),
}


class ReportError(Exception):
    """Anything that should abort without touching the output file."""


def ch_query(base_url: str, user: str, password: str, database: str, query: str, params: dict) -> str:
    ch_params = {f"param_{k}": v for k, v in params.items()}
    try:
        resp = requests.post(
            base_url,
            params={"user": user, "password": password, "database": database, **ch_params},
            data=query.encode("utf-8"),
            timeout=30,
        )
    except requests.RequestException as e:
        raise ReportError(f"ClickHouse request failed: {e}") from e
    if resp.status_code != 200:
        raise ReportError(f"ClickHouse error {resp.status_code}: {resp.text.strip()[:500]}")
    return resp.text


def parse_tsv(text: str) -> list[list[str]]:
    rows = [line.split("\t") for line in text.splitlines() if line.strip()]
    return rows


def parse_ch_array(raw: str) -> list[str]:
    # ClickHouse TSV array literal, e.g. ['US','GB','PH']
    raw = raw.strip()
    if raw in ("[]", ""):
        return []
    inner = raw[1:-1]
    return [item.strip().strip("'") for item in inner.split(",") if item.strip()]


# ClickHouse's TSV output escapes apostrophes as \' (confirmed with a live query against
# cat_l1='TikTok's Featured Content', a value the country query hits often since it mixes every
# category). parse_tsv() doesn't undo this, so free-text fields in the country path need it
# unescaped before use — unlike fetch_topics()/fetch_audience() above, which niche reports have
# relied on unchanged and this doesn't touch.
_CH_TSV_UNESCAPE = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "0": "\0", "'": "'", "\\": "\\"}


def unescape_ch_tsv(s: str) -> str:
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            out.append(_CH_TSV_UNESCAPE.get(s[i + 1], s[i + 1]))
            i += 2
        else:
            out.append(s[i])
            i += 1
    return "".join(out)


def fetch_topics(base_url: str, user: str, password: str, database: str, niche: Niche) -> list[dict]:
    text = ch_query(base_url, user, password, database, TOPICS_QUERY, {"cat_l1": niche.cat_l1})
    rows = parse_tsv(text)
    topics = []
    for row in rows:
        if len(row) != 10:
            raise ReportError(f"unexpected column count in topics row: {row!r}")
        query_id, query_text, cat_l2, growth, trust, video_num, top_countries, win_start, win_end, computed_at = row
        topics.append(
            {
                "query_id": query_id,
                "topic": query_text,
                "subcategory": cat_l2 or "Uncategorized",
                "growthMultiplier": round(float(growth)),
                "trust": trust,
                "videoNum": None if video_num == "0" else int(video_num),
                "topCountries": parse_ch_array(top_countries),
                "win_start": win_start,
                "win_end": win_end,
                "computed_at": computed_at,
            }
        )
    return topics


def fetch_country_topics(base_url: str, user: str, password: str, database: str, country: Country) -> list[dict]:
    text = ch_query(base_url, user, password, database, COUNTRY_TOPICS_QUERY, {"region": country.code})
    rows = parse_tsv(text)
    topics = []
    for row in rows:
        if len(row) != 11:
            raise ReportError(f"unexpected column count in country topics row: {row!r}")
        (
            query_id,
            query_text,
            cat_l1,
            cat_l2,
            growth,
            trust,
            video_num,
            top_countries,
            win_start,
            win_end,
            computed_at,
        ) = row
        topics.append(
            {
                "query_id": query_id,
                "topic": unescape_ch_tsv(query_text),
                "category": unescape_ch_tsv(cat_l1) or "Uncategorized",
                "subcategory": unescape_ch_tsv(cat_l2) or "Uncategorized",
                "growthMultiplier": round(float(growth)),
                "trust": trust,
                "videoNum": None if video_num == "0" else int(video_num),
                "topCountries": parse_ch_array(top_countries),
                "win_start": win_start,
                "win_end": win_end,
                "computed_at": computed_at,
            }
        )
    return topics


def fetch_audience(base_url: str, user: str, password: str, database: str, query_id: str) -> str:
    text = ch_query(base_url, user, password, database, AUDIENCE_QUERY, {"query_id": query_id})
    rows = parse_tsv(text)
    if not rows:
        return "not enough audience data for this topic"
    age, gender, location = rows[0]
    parts = [p for p in (gender, age) if p]
    who = " ".join(parts) if parts else "unspecified audience"
    where = location or "unspecified country"
    return f"{who}, {where} (dominant segment, snapshot at collection date)"


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def render_ts(niche: Niche, topics: list[dict], audience: str, updated_at: str) -> str:
    top = topics[0]
    computed_at = top["computed_at"].replace(" ", "T") + "Z"
    window_start = min(t["win_start"] for t in topics)
    window_end = max(t["win_end"] for t in topics)

    def ts_topic(t: dict) -> str:
        video_num = "null" if t["videoNum"] is None else str(t["videoNum"])
        countries = ", ".join(f'"{c}"' for c in t["topCountries"])
        topic = ts_escape(t["topic"])
        subcategory = ts_escape(t["subcategory"])
        return (
            "    {\n"
            f'      topic: "{topic}",\n'
            f'      subcategory: "{subcategory}",\n'
            f'      growthMultiplier: {t["growthMultiplier"]},\n'
            f'      trust: "{t["trust"]}",\n'
            f"      videoNum: {video_num},\n"
            f"      topCountries: [{countries}],\n"
            "    },"
        )

    topics_ts = "\n".join(ts_topic(t) for t in topics)
    top_topic_escaped = ts_escape(top["topic"])
    audience_escaped = ts_escape(audience)
    methodology_escaped = ts_escape(METHODOLOGY_NOTE)

    return f"""// Single source of truth for the {niche.category} trends report.
// Generated by scripts/generate-reports.py from ClickHouse `csi.v_topic_metrics`
// (region=global, growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0).
// Do not hand-edit the numbers here — rerun the generator instead. The same object feeds
// the human-readable page, its llms-full.txt and the JSON-LD blocks, so a change here changes
// all three at once (no drift between "visible" and "AI-facing" content).

import type {{ TikTokReport }} from "./tiktok-report-types";

export const {niche.export_name}: TikTokReport = {{
  category: "{niche.category}",
  region: "global",
  computedAt: "{computed_at}",
  windowStart: "{window_start}",
  windowEnd: "{window_end}",
  updatedAt: "{updated_at}",
  topics: [
{topics_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightTopic: {{
    topic: "{top_topic_escaped}",
    audience: "{audience_escaped}",
  }},
}};
"""


def render_country_ts(country: Country, topics: list[dict], audience: str, updated_at: str) -> str:
    top = topics[0]
    computed_at = top["computed_at"].replace(" ", "T") + "Z"
    window_start = min(t["win_start"] for t in topics)
    window_end = max(t["win_end"] for t in topics)

    def ts_topic(t: dict) -> str:
        video_num = "null" if t["videoNum"] is None else str(t["videoNum"])
        countries = ", ".join(f'"{c}"' for c in t["topCountries"])
        topic = ts_escape(t["topic"])
        category = ts_escape(t["category"])
        subcategory = ts_escape(t["subcategory"])
        return (
            "    {\n"
            f'      topic: "{topic}",\n'
            f'      category: "{category}",\n'
            f'      subcategory: "{subcategory}",\n'
            f'      growthMultiplier: {t["growthMultiplier"]},\n'
            f'      trust: "{t["trust"]}",\n'
            f"      videoNum: {video_num},\n"
            f"      topCountries: [{countries}],\n"
            "    },"
        )

    topics_ts = "\n".join(ts_topic(t) for t in topics)
    top_topic_escaped = ts_escape(top["topic"])
    audience_escaped = ts_escape(audience)
    methodology_escaped = ts_escape(COUNTRY_METHODOLOGY_NOTE)

    return f"""// Single source of truth for the TikTok trends in {country.name} report.
// Generated by scripts/generate-reports.py from ClickHouse `csi.v_topic_metrics`
// (region='{country.code}', growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0).
// Do not hand-edit the numbers here — rerun the generator instead. The same object feeds
// the human-readable page, its llms-full.txt and the JSON-LD blocks, so a change here changes
// all three at once (no drift between "visible" and "AI-facing" content).

import type {{ TikTokCountryReport }} from "./tiktok-country-report-types";

export const {country.export_name}: TikTokCountryReport = {{
  country: "{country.name}",
  countryCode: "{country.code}",
  computedAt: "{computed_at}",
  windowStart: "{window_start}",
  windowEnd: "{window_end}",
  updatedAt: "{updated_at}",
  topics: [
{topics_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightTopic: {{
    topic: "{top_topic_escaped}",
    audience: "{audience_escaped}",
  }},
}};
"""


def generate(niche: Niche, out_dir: str, base_url: str, user: str, password: str, database: str) -> str:
    topics = fetch_topics(base_url, user, password, database, niche)
    if len(topics) < MIN_TOPICS:
        raise ReportError(
            f"only {len(topics)} topics for niche={niche.key} (need >= {MIN_TOPICS}); refusing to publish"
        )

    audience = fetch_audience(base_url, user, password, database, topics[0]["query_id"])
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    ts_content = render_ts(niche, topics, audience, updated_at)

    out_path = os.path.join(out_dir, niche.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


def generate_country(country: Country, out_dir: str, base_url: str, user: str, password: str, database: str) -> str:
    topics = fetch_country_topics(base_url, user, password, database, country)
    if len(topics) < MIN_TOPICS:
        raise ReportError(
            f"only {len(topics)} topics for country={country.key} (need >= {MIN_TOPICS}); refusing to publish"
        )

    audience = unescape_ch_tsv(fetch_audience(base_url, user, password, database, topics[0]["query_id"]))
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    ts_content = render_country_ts(country, topics, audience, updated_at)

    out_path = os.path.join(out_dir, country.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--niche", default="all", choices=sorted(NICHES) + ["all"])
    parser.add_argument("--country", default="all", choices=sorted(COUNTRIES) + ["all"])
    parser.add_argument(
        "--out-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data"),
        help="directory to write <niche>-report.ts / tiktok-country-<code>-report.ts into (default: repo's src/data)",
    )
    args = parser.parse_args()

    try:
        base_url = os.environ["CSI_CH_URL"]
        user = os.environ["CSI_CH_USER"]
        password = os.environ["CSI_CH_PASSWORD"]
        database = os.environ.get("CSI_CH_DATABASE", "csi")
    except KeyError as e:
        print(f"generate-reports: missing required env var {e}", file=sys.stderr)
        return 1

    niches = list(NICHES.values()) if args.niche == "all" else [NICHES[args.niche]]
    countries = list(COUNTRIES.values()) if args.country == "all" else [COUNTRIES[args.country]]

    ok_count = 0
    for niche in niches:
        try:
            out_path = generate(niche, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: niche={niche.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    for country in countries:
        try:
            out_path = generate_country(country, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: country={country.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    if ok_count == 0:
        print("generate-reports: every niche and country failed, nothing published", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
