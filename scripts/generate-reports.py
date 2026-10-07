#!/usr/bin/env python3
"""Regenerate src/data/<niche>-report.ts from csi.v_topic_metrics (GG-724).

Read-only against ClickHouse (SELECT only). Run daily by
vira-trends-reports.service, after CSI's nightly collection + load finishes
(~04:21 UTC), on server vira.

Usage:
    generate-reports.py [--niche all|gourmet|...] [--out-dir DIR]

`--niche all` (the default) regenerates every niche in NICHES. A bad niche
(too few rows, stale/failed query) is skipped with an error on stderr; the
other niches in the same run still get published. The whole run only exits
non-zero if every niche failed.

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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--niche", default="all", choices=sorted(NICHES) + ["all"])
    parser.add_argument(
        "--out-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data"),
        help="directory to write <niche>-report.ts into (default: repo's src/data)",
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

    ok_count = 0
    for niche in niches:
        try:
            out_path = generate(niche, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: niche={niche.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    if ok_count == 0:
        print("generate-reports: every niche failed, nothing published", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
