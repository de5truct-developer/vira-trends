#!/usr/bin/env python3
"""Regenerate src/data/<niche>-report.ts from csi.v_topic_metrics (GG-724).

Read-only against ClickHouse (SELECT only). Run daily by
vira-trends-reports.service, after CSI's nightly collection + load finishes
(~04:21 UTC), on server vira.

Usage:
    generate-reports.py [--niche all|gourmet|...] [--country all|us|...]
                        [--subcategory all|gourmet-food-tutorials|...] [--out-dir DIR]
    generate-reports.py --discover

`--niche all`, `--country all` and `--subcategory all` (all three the default) regenerate every
niche/country/subcategory listed in src/data/tiktok-<niches|countries|subcategories>-manifest.json
(category, geography, and category-within-category — see those files, or --discover below, for
why only some countries/subcategories have an entry). A bad niche, country or subcategory (too
few rows, stale/failed query) is skipped with an error on stderr; everything else in the same run
still gets published. The whole run only exits non-zero if everything failed. This is what the
daily `vira-trends-reports.service` timer runs.

`--discover` is a separate mode (run by its own, less frequent timer — see
vira-trends-discover-tiktok.timer): it counts the *entire* cat_l1/region/(cat_l1, cat_l2) space in
ClickHouse, adds anything new that clears the same thresholds already used to build the manifests
to those manifest files and publishes it, and logs (without touching the page) anything already
published that has dropped below threshold. It does not also regenerate the niches/countries/
subcategories already in the manifests — that's what the plain `--niche/--country/--subcategory
all` (default) run above already does, daily.

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
import json
import os
import re
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

# Subcategory reports (GG-724 subcategory expansion): top-10 growing topics within one cat_l2,
# nested inside one of the 24 existing cat_l1 niches above — a narrower cut of the same niche
# query, fixing cat_l2 in addition to cat_l1. No cat_l2 column in the SELECT: it's fixed for the
# whole page, so it would just repeat the page title on every row.
SUBCATEGORY_TOPICS_QUERY = """
SELECT query_id, query_text, growth, trust, video_num, top_countries,
       win_start, win_end, computed_at
FROM v_topic_metrics
WHERE region = 'global' AND cat_l1 = {cat_l1:String} AND cat_l2 = {cat_l2:String}
  AND growth_reason = 'ok' AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
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

SUBCATEGORY_METHODOLOGY_NOTE = (
    "TikTok Creative Center data, collected by Vira's own account via Creative Search Insights, "
    "filtered to this one subcategory within its parent niche (TikTok's own two-level category "
    "taxonomy). Growth = 7/14/21-day median vs. prior period, shown only when trust is medium or "
    'high. Video count as reported by TikTok; "not reported" (video_num=0) means TikTok did not '
    "report a count for that topic, not zero competition. Updated daily."
)


# Manifests (GG-724 auto-discovery): the hand-maintained NICHES/COUNTRIES/SUBCATEGORIES dicts
# this generator used to hardcode now live in src/data/tiktok-<niches|countries|subcategories>
# -manifest.json, checked into git. This script only *reads* those files below, exactly like it
# used to read the hardcoded dicts -- `--discover` (see near the bottom of this file) is the only
# code path that appends new entries to them, after a live count against ClickHouse clears the
# same thresholds documented there. Astro reads the same three JSON files to build its dynamic
# /reports/tiktok/[niche], /country/[code] and /sub/[slug] routes, so there is exactly one place
# that knows which niches/countries/subcategories are published.

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DATA_DIR = os.path.join(REPO_ROOT, "src", "data")

NICHES_MANIFEST = os.path.join(DEFAULT_DATA_DIR, "tiktok-niches-manifest.json")
COUNTRIES_MANIFEST = os.path.join(DEFAULT_DATA_DIR, "tiktok-countries-manifest.json")
SUBCATEGORIES_MANIFEST = os.path.join(DEFAULT_DATA_DIR, "tiktok-subcategories-manifest.json")


@dataclass(frozen=True)
class Niche:
    key: str            # CLI --niche value
    category: str       # display name, e.g. "Gourmet"
    cat_l1: str          # csi.v_topic_metrics.cat_l1 filter value
    export_name: str     # exported TS const, e.g. gourmetReport
    out_file: str        # relative to repo src/data/


@dataclass(frozen=True)
class Country:
    key: str            # CLI --country value, e.g. "us"
    name: str            # display name, e.g. "United States"
    code: str            # csi.v_topic_metrics.region filter value, e.g. "US"
    export_name: str     # exported TS const, e.g. usCountryReport
    out_file: str        # relative to repo src/data/


@dataclass(frozen=True)
class Subcategory:
    key: str              # CLI --subcategory value, e.g. "gourmet-food-tutorials"
    subcategory: str      # display name, e.g. "Food Tutorials"
    parent_key: str       # Niche.key this nests under, e.g. "gourmet"
    parent_category: str  # Niche.category display name, e.g. "Gourmet"
    cat_l1: str            # csi.v_topic_metrics.cat_l1 filter value
    cat_l2: str            # csi.v_topic_metrics.cat_l2 filter value
    export_name: str       # exported TS const, e.g. gourmetFoodTutorialsSubReport
    out_file: str          # relative to repo src/data/


def _load_manifest(path: str) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _dump_manifest(path: str, rows: list[dict]) -> None:
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
        f.write("\n")


def load_niches(path: str = NICHES_MANIFEST) -> dict[str, Niche]:
    return {
        row["slug"]: Niche(
            key=row["slug"],
            category=row["category"],
            cat_l1=row["catL1"],
            export_name=row["exportName"],
            out_file=row["dataFile"],
        )
        for row in _load_manifest(path)
    }


def load_countries(path: str = COUNTRIES_MANIFEST) -> dict[str, Country]:
    return {
        row["slug"]: Country(
            key=row["slug"],
            name=row["name"],
            code=row["code"],
            export_name=row["exportName"],
            out_file=row["dataFile"],
        )
        for row in _load_manifest(path)
    }


def load_subcategories(path: str = SUBCATEGORIES_MANIFEST) -> dict[str, Subcategory]:
    return {
        row["slug"]: Subcategory(
            key=row["slug"],
            subcategory=row["subcategory"],
            parent_key=row["parentSlug"],
            parent_category=row["parentCategory"],
            cat_l1=row["catL1"],
            cat_l2=row["catL2"],
            export_name=row["exportName"],
            out_file=row["dataFile"],
        )
        for row in _load_manifest(path)
    }


# Loaded once at import time, same as the hardcoded dicts this replaces. Every code path except
# `--discover` (the daily `--niche/--country/--subcategory all` regeneration, and Astro's build)
# just reads whatever is in the manifest files, unchanged from how it read the old static dicts.
NICHES: dict[str, Niche] = load_niches()
COUNTRIES: dict[str, Country] = load_countries()
SUBCATEGORIES: dict[str, Subcategory] = load_subcategories()


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


def fetch_subcategory_topics(
    base_url: str, user: str, password: str, database: str, subcategory: Subcategory
) -> list[dict]:
    text = ch_query(
        base_url,
        user,
        password,
        database,
        SUBCATEGORY_TOPICS_QUERY,
        {"cat_l1": subcategory.cat_l1, "cat_l2": subcategory.cat_l2},
    )
    rows = parse_tsv(text)
    topics = []
    for row in rows:
        if len(row) != 9:
            raise ReportError(f"unexpected column count in subcategory topics row: {row!r}")
        query_id, query_text, growth, trust, video_num, top_countries, win_start, win_end, computed_at = row
        topics.append(
            {
                "query_id": query_id,
                "topic": unescape_ch_tsv(query_text),
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


def render_subcategory_ts(subcategory: Subcategory, topics: list[dict], audience: str, updated_at: str) -> str:
    top = topics[0]
    computed_at = top["computed_at"].replace(" ", "T") + "Z"
    window_start = min(t["win_start"] for t in topics)
    window_end = max(t["win_end"] for t in topics)

    def ts_topic(t: dict) -> str:
        video_num = "null" if t["videoNum"] is None else str(t["videoNum"])
        countries = ", ".join(f'"{c}"' for c in t["topCountries"])
        topic = ts_escape(t["topic"])
        return (
            "    {\n"
            f'      topic: "{topic}",\n'
            f'      growthMultiplier: {t["growthMultiplier"]},\n'
            f'      trust: "{t["trust"]}",\n'
            f"      videoNum: {video_num},\n"
            f"      topCountries: [{countries}],\n"
            "    },"
        )

    topics_ts = "\n".join(ts_topic(t) for t in topics)
    top_topic_escaped = ts_escape(top["topic"])
    audience_escaped = ts_escape(audience)
    methodology_escaped = ts_escape(SUBCATEGORY_METHODOLOGY_NOTE)

    return f"""// Single source of truth for the {subcategory.subcategory} trends report (part of
// {subcategory.parent_category}).
// Generated by scripts/generate-reports.py from ClickHouse `csi.v_topic_metrics`
// (region=global, cat_l1='{subcategory.cat_l1}', cat_l2='{subcategory.cat_l2}', growth_reason='ok',
// trust='high', quantized=0, coarse=0, shared_n=0).
// Do not hand-edit the numbers here — rerun the generator instead. The same object feeds
// the human-readable page, its llms-full.txt and the JSON-LD blocks, so a change here changes
// all three at once (no drift between "visible" and "AI-facing" content).

import type {{ TikTokSubcategoryReport }} from "./tiktok-subcategory-report-types";

export const {subcategory.export_name}: TikTokSubcategoryReport = {{
  subcategory: "{ts_escape(subcategory.subcategory)}",
  parentCategory: "{ts_escape(subcategory.parent_category)}",
  parentSlug: "{subcategory.parent_key}",
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


def generate_subcategory(
    subcategory: Subcategory, out_dir: str, base_url: str, user: str, password: str, database: str
) -> str:
    topics = fetch_subcategory_topics(base_url, user, password, database, subcategory)
    if len(topics) < MIN_TOPICS:
        raise ReportError(
            f"only {len(topics)} topics for subcategory={subcategory.key} "
            f"(need >= {MIN_TOPICS}); refusing to publish"
        )

    audience = unescape_ch_tsv(fetch_audience(base_url, user, password, database, topics[0]["query_id"]))
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    ts_content = render_subcategory_ts(subcategory, topics, audience, updated_at)

    out_path = os.path.join(out_dir, subcategory.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


# ---------------------------------------------------------------------------
# Auto-discovery (GG-724): find new niches/countries/subcategories (or ones that
# have dropped below their publishing threshold) by counting the *entire*
# cat_l1 / region / (cat_l1, cat_l2) space in csi.v_topic_metrics, instead of
# only ever looking at the slugs already in the manifests. Read-only (SELECT
# only, no writes to ClickHouse). Applies the exact same quality filters and
# thresholds that were already used to hand-build NICHES/COUNTRIES/SUBCATEGORIES
# (see Research/2026-10-07 GG-724 *.md) -- this just runs them against
# everything instead of a fixed list, and only ever *adds* to the manifests.
# Never removes a published slug: a niche/country/subcategory that drops below
# threshold keeps its page with its last good data (same "don't overwrite good
# data with bad" rule generate()/generate_country()/generate_subcategory()
# already apply day to day) and is only reported as "degraded" in the log.

# Editorial threshold for country reports: *not* the same as MIN_TOPICS. A
# country report mixes every category, so a thin candidate pool makes the
# daily top-10 flicker; see Research/2026-10-07 GG-724 TikTok-отчёты по
# странам.md for why >=200 (not >=MIN_TOPICS) was picked as the bar for adding
# a country to the published list at all. Unchanged from that one-time count.
COUNTRY_EDITORIAL_MIN_TOPICS = 200

DISCOVER_NICHES_QUERY = """
SELECT cat_l1, count() AS n
FROM v_topic_metrics
WHERE region = 'global' AND growth_reason = 'ok' AND trust = 'high'
  AND quantized = 0 AND coarse = 0 AND shared_n = 0
GROUP BY cat_l1
FORMAT TSV
"""

DISCOVER_COUNTRIES_QUERY = """
SELECT region, count() AS n
FROM v_topic_metrics
WHERE growth_reason = 'ok' AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
  AND region != 'global'
GROUP BY region
FORMAT TSV
"""

DISCOVER_SUBCATEGORIES_QUERY = """
SELECT cat_l1, cat_l2, count() AS n
FROM v_topic_metrics
WHERE region = 'global' AND growth_reason = 'ok' AND trust = 'high'
  AND quantized = 0 AND coarse = 0 AND shared_n = 0 AND cat_l2 != ''
GROUP BY cat_l1, cat_l2
FORMAT TSV
"""

ISO_COUNTRY_NAMES: dict[str, str] = {
    "AD": "Andorra", "AE": "United Arab Emirates", "AF": "Afghanistan", "AG": "Antigua and Barbuda",
    "AI": "Anguilla", "AL": "Albania", "AM": "Armenia", "AO": "Angola", "AQ": "Antarctica",
    "AR": "Argentina", "AS": "American Samoa", "AT": "Austria", "AU": "Australia", "AW": "Aruba",
    "AX": "Aland Islands", "AZ": "Azerbaijan", "BA": "Bosnia and Herzegovina", "BB": "Barbados",
    "BD": "Bangladesh", "BE": "Belgium", "BF": "Burkina Faso", "BG": "Bulgaria", "BH": "Bahrain",
    "BI": "Burundi", "BJ": "Benin", "BL": "Saint Barthelemy", "BM": "Bermuda", "BN": "Brunei",
    "BO": "Bolivia", "BQ": "Bonaire, Sint Eustatius and Saba", "BR": "Brazil", "BS": "Bahamas",
    "BT": "Bhutan", "BV": "Bouvet Island", "BW": "Botswana", "BY": "Belarus", "BZ": "Belize",
    "CA": "Canada", "CC": "Cocos (Keeling) Islands", "CD": "DR Congo",
    "CF": "Central African Republic", "CG": "Congo", "CH": "Switzerland",
    "CI": "Cote d Ivoire", "CK": "Cook Islands", "CL": "Chile", "CM": "Cameroon", "CN": "China",
    "CO": "Colombia", "CR": "Costa Rica", "CU": "Cuba", "CV": "Cabo Verde", "CW": "Curacao",
    "CX": "Christmas Island", "CY": "Cyprus", "CZ": "Czechia", "DE": "Germany", "DJ": "Djibouti",
    "DK": "Denmark", "DM": "Dominica", "DO": "Dominican Republic", "DZ": "Algeria",
    "EC": "Ecuador", "EE": "Estonia", "EG": "Egypt", "EH": "Western Sahara", "ER": "Eritrea",
    "ES": "Spain", "ET": "Ethiopia", "FI": "Finland", "FJ": "Fiji", "FK": "Falkland Islands",
    "FM": "Micronesia", "FO": "Faroe Islands", "FR": "France", "GA": "Gabon",
    "GB": "United Kingdom", "GD": "Grenada", "GE": "Georgia", "GF": "French Guiana",
    "GG": "Guernsey", "GH": "Ghana", "GI": "Gibraltar", "GL": "Greenland", "GM": "Gambia",
    "GN": "Guinea", "GP": "Guadeloupe", "GQ": "Equatorial Guinea", "GR": "Greece",
    "GS": "South Georgia and South Sandwich Islands", "GT": "Guatemala", "GU": "Guam",
    "GW": "Guinea-Bissau", "GY": "Guyana", "HK": "Hong Kong", "HM": "Heard and McDonald Islands",
    "HN": "Honduras", "HR": "Croatia", "HT": "Haiti", "HU": "Hungary", "ID": "Indonesia",
    "IE": "Ireland", "IL": "Israel", "IM": "Isle of Man", "IN": "India",
    "IO": "British Indian Ocean Territory", "IQ": "Iraq", "IR": "Iran", "IS": "Iceland",
    "IT": "Italy", "JE": "Jersey", "JM": "Jamaica", "JO": "Jordan", "JP": "Japan",
    "KE": "Kenya", "KG": "Kyrgyzstan", "KH": "Cambodia", "KI": "Kiribati", "KM": "Comoros",
    "KN": "Saint Kitts and Nevis", "KP": "North Korea", "KR": "South Korea", "KW": "Kuwait",
    "KY": "Cayman Islands", "KZ": "Kazakhstan", "LA": "Laos", "LB": "Lebanon",
    "LC": "Saint Lucia", "LI": "Liechtenstein", "LK": "Sri Lanka", "LR": "Liberia",
    "LS": "Lesotho", "LT": "Lithuania", "LU": "Luxembourg", "LV": "Latvia", "LY": "Libya",
    "MA": "Morocco", "MC": "Monaco", "MD": "Moldova", "ME": "Montenegro",
    "MF": "Saint Martin", "MG": "Madagascar", "MH": "Marshall Islands", "MK": "North Macedonia",
    "ML": "Mali", "MM": "Myanmar", "MN": "Mongolia", "MO": "Macao",
    "MP": "Northern Mariana Islands", "MQ": "Martinique", "MR": "Mauritania", "MS": "Montserrat",
    "MT": "Malta", "MU": "Mauritius", "MV": "Maldives", "MW": "Malawi", "MX": "Mexico",
    "MY": "Malaysia", "MZ": "Mozambique", "NA": "Namibia", "NC": "New Caledonia",
    "NE": "Niger", "NF": "Norfolk Island", "NG": "Nigeria", "NI": "Nicaragua",
    "NL": "Netherlands", "NO": "Norway", "NP": "Nepal", "NR": "Nauru", "NU": "Niue",
    "NZ": "New Zealand", "OM": "Oman", "PA": "Panama", "PE": "Peru",
    "PF": "French Polynesia", "PG": "Papua New Guinea", "PH": "Philippines",
    "PK": "Pakistan", "PL": "Poland", "PM": "Saint Pierre and Miquelon",
    "PN": "Pitcairn", "PR": "Puerto Rico", "PS": "Palestine", "PT": "Portugal",
    "PW": "Palau", "PY": "Paraguay", "QA": "Qatar", "RE": "Reunion", "RO": "Romania",
    "RS": "Serbia", "RU": "Russia", "RW": "Rwanda", "SA": "Saudi Arabia",
    "SB": "Solomon Islands", "SC": "Seychelles", "SD": "Sudan", "SE": "Sweden",
    "SG": "Singapore", "SH": "Saint Helena", "SI": "Slovenia",
    "SJ": "Svalbard and Jan Mayen", "SK": "Slovakia", "SL": "Sierra Leone",
    "SM": "San Marino", "SN": "Senegal", "SO": "Somalia", "SR": "Suriname",
    "SS": "South Sudan", "ST": "Sao Tome and Principe", "SV": "El Salvador",
    "SX": "Sint Maarten", "SY": "Syria", "SZ": "Eswatini", "TC": "Turks and Caicos Islands",
    "TD": "Chad", "TF": "French Southern Territories", "TG": "Togo", "TH": "Thailand",
    "TJ": "Tajikistan", "TK": "Tokelau", "TL": "Timor-Leste", "TM": "Turkmenistan",
    "TN": "Tunisia", "TO": "Tonga", "TR": "Turkey", "TT": "Trinidad and Tobago",
    "TV": "Tuvalu", "TW": "Taiwan", "TZ": "Tanzania", "UA": "Ukraine", "UG": "Uganda",
    "UM": "United States Minor Outlying Islands", "US": "United States",
    "UY": "Uruguay", "UZ": "Uzbekistan", "VA": "Vatican City",
    "VC": "Saint Vincent and the Grenadines", "VE": "Venezuela",
    "VG": "British Virgin Islands", "VI": "United States Virgin Islands",
    "VN": "Vietnam", "VU": "Vanuatu", "WF": "Wallis and Futuna", "WS": "Samoa",
    "YE": "Yemen", "YT": "Mayotte", "ZA": "South Africa", "ZM": "Zambia", "ZW": "Zimbabwe",
}


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.strip().lower()).strip("-")
    return s or "untitled"


def unique_slug(base: str, taken: set[str]) -> str:
    if base not in taken:
        return base
    i = 2
    while f"{base}-{i}" in taken:
        i += 1
    return f"{base}-{i}"


def camel_export_name(slug: str, suffix: str) -> str:
    first, *rest = slug.split("-")
    return first + "".join(p.capitalize() for p in rest) + suffix


def display_category(cat_l1: str) -> str:
    # Generalizes the one-off "TikTok's Featured Content" -> "Featured Content" fix (see
    # Research/2026-10-07 GG-724 максимальное покрытие TikTok-ниш.md): TikTokReportPage.astro
    # always titles the page "TikTok {category}", so a cat_l1 that already starts with "TikTok"
    # would otherwise render as "TikTok TikTok's Featured Content".
    stripped = re.sub(r"^tiktok's?\s+", "", cat_l1, flags=re.IGNORECASE)
    return stripped or cat_l1


def discover_niches(
    base_url: str, user: str, password: str, database: str, existing: dict[str, Niche]
) -> tuple[list[Niche], list[tuple[str, int]]]:
    rows = parse_tsv(ch_query(base_url, user, password, database, DISCOVER_NICHES_QUERY, {}))
    existing_by_cat_l1 = {n.cat_l1: key for key, n in existing.items()}
    taken_slugs = set(existing)

    new_niches: list[Niche] = []
    degraded: list[tuple[str, int]] = []
    for row in rows:
        if len(row) != 2:
            continue
        cat_l1 = unescape_ch_tsv(row[0])
        n = int(row[1])
        existing_key = existing_by_cat_l1.get(cat_l1)
        if existing_key is not None:
            if n < MIN_TOPICS:
                degraded.append((existing_key, n))
            continue
        if n < MIN_TOPICS:
            continue
        slug = unique_slug(slugify(cat_l1), taken_slugs)
        taken_slugs.add(slug)
        new_niches.append(
            Niche(
                key=slug,
                category=display_category(cat_l1),
                cat_l1=cat_l1,
                export_name=camel_export_name(slug, "Report"),
                out_file=f"tiktok-{slug}-report.ts",
            )
        )
    return new_niches, degraded


def discover_countries(
    base_url: str, user: str, password: str, database: str, existing: dict[str, Country]
) -> tuple[list[Country], list[tuple[str, int]]]:
    rows = parse_tsv(ch_query(base_url, user, password, database, DISCOVER_COUNTRIES_QUERY, {}))
    existing_by_code = {c.code: key for key, c in existing.items()}
    taken_slugs = set(existing)

    new_countries: list[Country] = []
    degraded: list[tuple[str, int]] = []
    for row in rows:
        if len(row) != 2:
            continue
        code = unescape_ch_tsv(row[0]).upper()
        n = int(row[1])
        existing_key = existing_by_code.get(code)
        if existing_key is not None:
            if n < COUNTRY_EDITORIAL_MIN_TOPICS:
                degraded.append((existing_key, n))
            continue
        if n < COUNTRY_EDITORIAL_MIN_TOPICS:
            continue
        slug = unique_slug(code.lower(), taken_slugs)
        taken_slugs.add(slug)
        new_countries.append(
            Country(
                key=slug,
                name=ISO_COUNTRY_NAMES.get(code, code),
                code=code,
                export_name=camel_export_name(slug, "CountryReport"),
                out_file=f"tiktok-country-{slug}-report.ts",
            )
        )
    return new_countries, degraded


def discover_subcategories(
    base_url: str,
    user: str,
    password: str,
    database: str,
    existing: dict[str, Subcategory],
    niches: dict[str, Niche],
) -> tuple[list[Subcategory], list[tuple[str, int]]]:
    rows = parse_tsv(ch_query(base_url, user, password, database, DISCOVER_SUBCATEGORIES_QUERY, {}))
    cat_l1_to_niche = {n.cat_l1: n for n in niches.values()}
    existing_by_pair = {(s.cat_l1, s.cat_l2): key for key, s in existing.items()}
    taken_slugs = set(existing)

    counts: dict[tuple[str, str], int] = {}
    qualifying_by_niche: dict[str, list[str]] = {}  # niche key -> [cat_l2, ...], n >= MIN_TOPICS
    for row in rows:
        if len(row) != 3:
            continue
        cat_l1 = unescape_ch_tsv(row[0])
        cat_l2 = unescape_ch_tsv(row[1])
        n = int(row[2])
        counts[(cat_l1, cat_l2)] = n
        niche = cat_l1_to_niche.get(cat_l1)
        if niche is not None and n >= MIN_TOPICS:
            qualifying_by_niche.setdefault(niche.key, []).append(cat_l2)

    new_subcategories: list[Subcategory] = []
    for niche_key, cat_l2s in qualifying_by_niche.items():
        if len(cat_l2s) < 2:
            # Same editorial rule as the original SUBCATEGORIES build (see Research/2026-10-07
            # GG-724 TikTok-подкатегории.md): a niche with exactly one qualifying subcategory
            # would just duplicate that niche's own top-10 one-for-one.
            continue
        niche = niches[niche_key]
        for cat_l2 in cat_l2s:
            if (niche.cat_l1, cat_l2) in existing_by_pair:
                continue
            slug = unique_slug(f"{niche_key}-{slugify(cat_l2)}", taken_slugs)
            taken_slugs.add(slug)
            new_subcategories.append(
                Subcategory(
                    key=slug,
                    subcategory=cat_l2,
                    parent_key=niche_key,
                    parent_category=niche.category,
                    cat_l1=niche.cat_l1,
                    cat_l2=cat_l2,
                    export_name=camel_export_name(slug, "SubReport"),
                    out_file=f"tiktok-sub-{slug}-report.ts",
                )
            )

    degraded = [
        (key, counts.get((s.cat_l1, s.cat_l2), 0))
        for key, s in existing.items()
        if counts.get((s.cat_l1, s.cat_l2), 0) < MIN_TOPICS
    ]
    return new_subcategories, degraded


def run_discover(out_dir: str, base_url: str, user: str, password: str, database: str) -> int:
    try:
        new_niches, degraded_niches = discover_niches(base_url, user, password, database, NICHES)
    except ReportError as e:
        print(f"generate-reports --discover: niche discovery query failed: {e}", file=sys.stderr)
        return 1

    all_niches = {**NICHES, **{n.key: n for n in new_niches}}

    try:
        new_countries, degraded_countries = discover_countries(base_url, user, password, database, COUNTRIES)
    except ReportError as e:
        print(f"generate-reports --discover: country discovery query failed: {e}", file=sys.stderr)
        return 1

    try:
        new_subcategories, degraded_subcategories = discover_subcategories(
            base_url, user, password, database, SUBCATEGORIES, all_niches
        )
    except ReportError as e:
        print(f"generate-reports --discover: subcategory discovery query failed: {e}", file=sys.stderr)
        return 1

    for niche in new_niches:
        try:
            out_path = generate(niche, out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports --discover: new niche={niche.key} failed to publish: {e}", file=sys.stderr)
            continue
        print(f"generate-reports --discover: published new niche {niche.key} ({out_path})")

    for country in new_countries:
        try:
            out_path = generate_country(country, out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports --discover: new country={country.key} failed to publish: {e}", file=sys.stderr)
            continue
        print(f"generate-reports --discover: published new country {country.key} ({out_path})")

    for subcategory in new_subcategories:
        try:
            out_path = generate_subcategory(subcategory, out_dir, base_url, user, password, database)
        except ReportError as e:
            print(
                f"generate-reports --discover: new subcategory={subcategory.key} failed to publish: {e}",
                file=sys.stderr,
            )
            continue
        print(f"generate-reports --discover: published new subcategory {subcategory.key} ({out_path})")

    # Only entries whose report file actually got written go into the manifest -- same "don't
    # publish a broken page" guarantee as the daily run (a brand new candidate can still fail
    # MIN_TOPICS/network on its very first fetch even after clearing the discovery count).
    ok_new_niches = [n for n in new_niches if os.path.exists(os.path.join(out_dir, n.out_file))]
    ok_new_countries = [c for c in new_countries if os.path.exists(os.path.join(out_dir, c.out_file))]
    ok_new_subcategories = [s for s in new_subcategories if os.path.exists(os.path.join(out_dir, s.out_file))]

    if ok_new_niches:
        rows = _load_manifest(NICHES_MANIFEST)
        rows += [
            {"slug": n.key, "category": n.category, "catL1": n.cat_l1, "exportName": n.export_name, "dataFile": n.out_file}
            for n in ok_new_niches
        ]
        rows.sort(key=lambda r: r["slug"])
        _dump_manifest(NICHES_MANIFEST, rows)

    if ok_new_countries:
        rows = _load_manifest(COUNTRIES_MANIFEST)
        rows += [
            {"slug": c.key, "name": c.name, "code": c.code, "exportName": c.export_name, "dataFile": c.out_file}
            for c in ok_new_countries
        ]
        rows.sort(key=lambda r: r["slug"])
        _dump_manifest(COUNTRIES_MANIFEST, rows)

    if ok_new_subcategories:
        rows = _load_manifest(SUBCATEGORIES_MANIFEST)
        rows += [
            {
                "slug": s.key,
                "subcategory": s.subcategory,
                "parentSlug": s.parent_key,
                "parentCategory": s.parent_category,
                "catL1": s.cat_l1,
                "catL2": s.cat_l2,
                "exportName": s.export_name,
                "dataFile": s.out_file,
            }
            for s in ok_new_subcategories
        ]
        rows.sort(key=lambda r: r["slug"])
        _dump_manifest(SUBCATEGORIES_MANIFEST, rows)

    print(
        "generate-reports --discover: summary -- "
        f"niches: {len(NICHES)} published, {len(ok_new_niches)} new, {len(degraded_niches)} below threshold today; "
        f"countries: {len(COUNTRIES)} published, {len(ok_new_countries)} new, {len(degraded_countries)} below threshold today; "
        f"subcategories: {len(SUBCATEGORIES)} published, {len(ok_new_subcategories)} new, "
        f"{len(degraded_subcategories)} below threshold today"
    )
    for key, n in degraded_niches:
        print(f"generate-reports --discover: niche={key} now has only {n} topics (< {MIN_TOPICS}); page kept as-is")
    for key, n in degraded_countries:
        print(
            f"generate-reports --discover: country={key} now has only {n} topics "
            f"(< {COUNTRY_EDITORIAL_MIN_TOPICS}); page kept as-is"
        )
    for key, n in degraded_subcategories:
        print(
            f"generate-reports --discover: subcategory={key} now has only {n} topics (< {MIN_TOPICS}); page kept as-is"
        )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--niche", default="all", choices=sorted(NICHES) + ["all"])
    parser.add_argument("--country", default="all", choices=sorted(COUNTRIES) + ["all"])
    parser.add_argument("--subcategory", default="all", choices=sorted(SUBCATEGORIES) + ["all"])
    parser.add_argument(
        "--out-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data"),
        help=(
            "directory to write <niche>-report.ts / tiktok-country-<code>-report.ts / "
            "tiktok-sub-<slug>-report.ts into (default: repo's src/data)"
        ),
    )
    parser.add_argument(
        "--discover",
        action="store_true",
        help=(
            "instead of regenerating the niches/countries/subcategories already in the "
            "manifests (--niche/--country/--subcategory, above), count the full cat_l1/region/"
            "(cat_l1, cat_l2) space in ClickHouse, add anything new that clears the same "
            "thresholds to the manifests and publish it, and log anything already published "
            "that has dropped below threshold (without touching its page). Meant for a separate, "
            "weekly timer -- does not also run the --niche/--country/--subcategory regeneration."
        ),
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

    if args.discover:
        return run_discover(args.out_dir, base_url, user, password, database)

    niches = list(NICHES.values()) if args.niche == "all" else [NICHES[args.niche]]
    countries = list(COUNTRIES.values()) if args.country == "all" else [COUNTRIES[args.country]]
    subcategories = list(SUBCATEGORIES.values()) if args.subcategory == "all" else [SUBCATEGORIES[args.subcategory]]

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

    for subcategory in subcategories:
        try:
            out_path = generate_subcategory(subcategory, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: subcategory={subcategory.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    if ok_count == 0:
        print("generate-reports: every niche, country and subcategory failed, nothing published", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
