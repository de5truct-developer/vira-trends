#!/usr/bin/env python3
"""Regenerate src/data/<niche>-report.ts from vira_analytics.channels_latest_mat (GG-724).

Read-only against ClickHouse (SELECT only). Separate pipeline from
generate-reports.py (TikTok/csi) -- different source database and different
upstream refresh schedule. Run daily by vira-trends-youtube-reports.service,
on server vira, well after the stats container's own
refresh_channels_latest_materialized cycle finishes (no fixed cron for that
job -- it floats; see Research note for the timing this was tuned against).

Usage:
    generate-youtube-reports.py [--niche all|food|...] [--subgenre all|pop-music|...] [--out-dir DIR]
    generate-youtube-reports.py --discover

`--niche all` and `--subgenre all` (both the default) regenerate every niche
and subgenre listed in src/data/youtube-<niches|subgenres>-manifest.json
(niches use the whole topic tag as their own page; subgenres are a narrower
tag nested inside the Music or Gaming niche -- see that manifest, or
--discover below, for why only music/gaming subgenres exist). A bad niche or
subgenre (too few channels, stale snapshot, failed query) is skipped with an
error on stderr; everything else in the same run still gets published. The
whole run only exits non-zero if everything failed. This is what the daily
vira-trends-youtube-reports.service timer runs.

`--discover` is a separate mode (run by its own, less frequent timer -- see
vira-trends-discover-youtube.timer): it counts every single YouTube topic
tag in channels_latest_mat (not just the ones already published), adds
anything new that clears MIN_CHANNELS to the manifests and publishes it, and
logs (without touching the page) anything already published that has
dropped below threshold. A new tag whose name looks like a music or video
game subgenre (contains "music"/"game", same substring that distinguished
the 13 music + 10 game subgenres from the 36 niches when this was done by
hand) is only published as a subgenre of Music/Gaming, and only if its
top-10 channels don't mostly duplicate that parent niche's own top-10 (same
check used when the 23 subgenres were added). It does not also regenerate
the niches/subgenres already in the manifests -- that's what the plain
--niche/--subgenre all (default) run above already does, daily.

Env (same ClickHouse instance/user as CSI, different database):
    CSI_CH_URL        e.g. http://127.0.0.1:8123
    CSI_CH_USER
    CSI_CH_PASSWORD
    (database is hardcoded to vira_analytics below, not CSI_CH_DATABASE --
    that var is "csi" for the TikTok pipeline)

For a single niche, nothing is written and that niche is skipped if its
query fails, returns too few channels, or its freshest snapshot is stale,
so a bad day never publishes broken data for that niche.
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

DATABASE = "vira_analytics"
MIN_CHANNELS = 5  # fewer rows than this: refuse to publish, something's wrong upstream
STALE_DAYS = 3  # dataAsOf older than this many days: refuse to publish
MIN_SUBSCRIBERS = 50_000  # same threshold for every niche/subgenre -- not calibrated per topic
MIN_BASELINE = 20_000  # minimum (subscribers - subs_30d), excludes from-zero channels

CHANNELS_QUERY = """
SELECT channel_id, channel_name, channel_url, subscribers, subs_30d, views, views_30d,
       topic, channel_created_at, latest_stat_date,
       round(subs_30d / greatest(subscribers - subs_30d, 1) * 100, 1) AS growth_pct
FROM channels_latest_mat FINAL
WHERE positionCaseInsensitive(coalesce(topic,''), {topic_match:String}) > 0
  AND length(splitByChar(',', coalesce(topic,''))) <= 2
  AND insufficient_history_30d = 0
  AND insufficient_views_history_30d = 0
  AND subscribers >= {min_subscribers:UInt64}
  AND (subscribers - subs_30d) >= {min_baseline:UInt64}
  AND latest_stat_date >= today() - 3
ORDER BY growth_pct DESC
LIMIT 10
FORMAT TSV
"""

def methodology_note(min_subscribers: int) -> str:
    return (
        "YouTube public channel statistics (subscribers, views), collected daily by Vira's own "
        "channel-tracking pipeline. Growth % = subscribers gained in the last 30 days divided by "
        "the subscriber count 30 days ago, shown only for channels with a complete 30-day history "
        f"and at least {min_subscribers:,} current subscribers. Topic is YouTube's own "
        "classification for the channel, not Vira's; channels with more than 2 topic tags are "
        "excluded to keep the niche match tight."
    )


def subgenre_methodology_note(min_subscribers: int, parent_category: str) -> str:
    return (
        "YouTube public channel statistics (subscribers, views), collected daily by Vira's own "
        "channel-tracking pipeline, filtered to this one subgenre tag nested inside the broader "
        f"{parent_category} niche. Growth % = subscribers gained in the last 30 days divided by "
        "the subscriber count 30 days ago, shown only for channels with a complete 30-day history "
        f"and at least {min_subscribers:,} current subscribers. Topic is YouTube's own "
        "classification for the channel, not Vira's; channels with more than 2 topic tags are "
        "excluded to keep the match tight."
    )


@dataclass(frozen=True)
class Niche:
    key: str            # CLI --niche value
    category: str       # display name, e.g. "Food"
    topic_match: str    # substring matched against channels_latest_mat.topic
    min_subscribers: int
    min_baseline: int   # minimum (subscribers - subs_30d), excludes from-zero channels
    export_name: str    # exported TS const, e.g. youtubeFoodReport
    out_file: str        # relative to repo src/data/


# Manifests (GG-724 auto-discovery): the hand-maintained NICHES/SUBGENRES dicts this generator
# used to hardcode now live in src/data/youtube-<niches|subgenres>-manifest.json, checked into
# git. This script only *reads* those files below, exactly like it used to read the hardcoded
# dicts -- `--discover` (see near the bottom of this file) is the only code path that appends new
# entries to them, after a live count against ClickHouse clears the same thresholds documented
# there. Astro reads the same two JSON files to build its dynamic /reports/youtube/[niche] and
# /sub/[slug] routes, so there is exactly one place that knows which niches/subgenres are
# published. min_subscribers/min_baseline are not stored per entry -- every niche and subgenre
# uses the same MIN_SUBSCRIBERS/MIN_BASELINE thresholds above, never calibrated per topic.

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DATA_DIR = os.path.join(REPO_ROOT, "src", "data")

NICHES_MANIFEST = os.path.join(DEFAULT_DATA_DIR, "youtube-niches-manifest.json")
SUBGENRES_MANIFEST = os.path.join(DEFAULT_DATA_DIR, "youtube-subgenres-manifest.json")


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
            topic_match=row["topicMatch"],
            min_subscribers=MIN_SUBSCRIBERS,
            min_baseline=MIN_BASELINE,
            export_name=row["exportName"],
            out_file=row["dataFile"],
        )
        for row in _load_manifest(path)
    }


# Loaded once at import time, same as the hardcoded dict this replaces. Every code path except
# `--discover` (the daily `--niche/--subgenre all` regeneration, and Astro's build) just reads
# whatever is in the manifest file, unchanged from how it read the old static dict.
NICHES: dict[str, Niche] = load_niches()


@dataclass(frozen=True)
class Subgenre:
    key: str              # CLI --subgenre value, e.g. "pop-music"
    subgenre: str         # display name, e.g. "Pop music"
    parent_key: str       # Niche.key this nests under: "music" or "gaming"
    parent_category: str  # Niche.category display name, e.g. "Music"
    topic_match: str      # substring matched against channels_latest_mat.topic
    min_subscribers: int
    min_baseline: int
    export_name: str      # exported TS const, e.g. youtubePopMusicSubReport
    out_file: str          # relative to repo src/data/


# GG-724 subgenre expansion (2026-10-07): narrower music/video-game topic tags, left out of the
# 36-niche expansion specifically because they're a finer split of the already-published
# Music/Gaming niches, with a stated risk of their top-10 just duplicating the parent niche's
# top-10. Checked live instead of guessed: ran the same CHANNELS_QUERY per candidate tag and
# diffed its top 10 against the Music/Gaming niche's own top 10 (see Research note "2026-10-07
# GG-724 YouTube-поджанры.md"). Worst overlap found was 4/10 (Music of Asia); most tags share 0-1
# channels with their parent. `--discover` below applies the same >=8/10 "basically a duplicate"
# rule to any future candidate (OVERLAP_DUPLICATE_THRESHOLD).
def load_subgenres(path: str = SUBGENRES_MANIFEST) -> dict[str, Subgenre]:
    return {
        row["slug"]: Subgenre(
            key=row["slug"],
            subgenre=row["subgenre"],
            parent_key=row["parentSlug"],
            parent_category=row["parentCategory"],
            topic_match=row["topicMatch"],
            min_subscribers=MIN_SUBSCRIBERS,
            min_baseline=MIN_BASELINE,
            export_name=row["exportName"],
            out_file=row["dataFile"],
        )
        for row in _load_manifest(path)
    }


SUBGENRES: dict[str, Subgenre] = load_subgenres()


class ReportError(Exception):
    """Anything that should abort without touching the output file."""


def ch_query(base_url: str, user: str, password: str, query: str, params: dict) -> str:
    ch_params = {f"param_{k}": v for k, v in params.items()}
    try:
        resp = requests.post(
            base_url,
            params={"user": user, "password": password, "database": DATABASE, **ch_params},
            data=query.encode("utf-8"),
            timeout=60,
        )
    except requests.RequestException as e:
        raise ReportError(f"ClickHouse request failed: {e}") from e
    if resp.status_code != 200:
        raise ReportError(f"ClickHouse error {resp.status_code}: {resp.text.strip()[:500]}")
    return resp.text


def parse_tsv(text: str) -> list[list[str]]:
    return [line.split("\t") for line in text.splitlines() if line.strip()]


def parse_date(raw: str) -> str | None:
    raw = raw.strip()
    if raw in ("", "\\N", "0000-00-00"):
        return None
    return raw[:10]


def fetch_channels(base_url: str, user: str, password: str, niche: Niche | Subgenre) -> list[dict]:
    # Works for both Niche and Subgenre -- both carry topic_match/min_subscribers/min_baseline.
    text = ch_query(
        base_url,
        user,
        password,
        CHANNELS_QUERY,
        {
            "topic_match": niche.topic_match,
            "min_subscribers": niche.min_subscribers,
            "min_baseline": niche.min_baseline,
        },
    )
    rows = parse_tsv(text)
    channels = []
    for row in rows:
        if len(row) != 11:
            raise ReportError(f"unexpected column count in channels row: {row!r}")
        (
            channel_id,
            channel_name,
            channel_url,
            subscribers,
            subs_30d,
            views,
            views_30d,
            topic,
            channel_created_at,
            latest_stat_date,
            growth_pct,
        ) = row
        channels.append(
            {
                "channelName": channel_name.strip(),
                "channelUrl": channel_url,
                "topic": topic,
                "subscribers": int(subscribers),
                "subsGained30d": int(subs_30d),
                "growthPct": float(growth_pct),
                "viewsGained30d": int(views_30d),
                "channelCreatedAt": parse_date(channel_created_at),
                "latestStatDate": parse_date(latest_stat_date),
            }
        )
    return channels


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def highlight_note(top: dict, data_as_of: str) -> str:
    baseline = top["subscribers"] - top["subsGained30d"]
    age_clause = None
    if top["channelCreatedAt"]:
        created_year = int(top["channelCreatedAt"][:4])
        as_of_year = int(data_as_of[:4])
        if as_of_year - created_year >= 2:
            age_clause = f"an established channel (created {created_year})"
        else:
            age_clause = f"a newer channel (created {created_year})"

    if top["subsGained30d"] >= baseline:
        cmp_clause = "more than its entire subscriber base a month earlier"
    else:
        cmp_clause = f"a {top['growthPct']}% increase over its subscriber base a month earlier"

    gained = f"{top['subsGained30d']:,}"
    if age_clause:
        return f"{age_clause} that gained {gained} subscribers in 30 days, {cmp_clause}"
    return f"gained {gained} subscribers in 30 days, {cmp_clause}"


def render_ts(niche: Niche, channels: list[dict], data_as_of: str, updated_at: str) -> str:
    top = channels[0]

    def ts_channel(c: dict) -> str:
        created_at = "null" if c["channelCreatedAt"] is None else f'"{c["channelCreatedAt"]}"'
        return (
            "    {\n"
            f'      channelName: "{ts_escape(c["channelName"])}",\n'
            f'      channelUrl: "{ts_escape(c["channelUrl"])}",\n'
            f'      topic: "{ts_escape(c["topic"])}",\n'
            f'      subscribers: {c["subscribers"]},\n'
            f'      subsGained30d: {c["subsGained30d"]},\n'
            f'      growthPct: {c["growthPct"]},\n'
            f'      viewsGained30d: {c["viewsGained30d"]},\n'
            f"      channelCreatedAt: {created_at},\n"
            "    },"
        )

    channels_ts = "\n".join(ts_channel(c) for c in channels)
    methodology_escaped = ts_escape(methodology_note(niche.min_subscribers))
    highlight_note_escaped = ts_escape(highlight_note(top, data_as_of))

    return f"""// Single source of truth for the YouTube {niche.category} channel growth report.
// Generated by scripts/generate-youtube-reports.py from ClickHouse
// `vira_analytics.channels_latest_mat` (topic contains "{niche.category}" with at most one other
// YouTube topic tag, subscribers >= {niche.min_subscribers:,}, had at least {niche.min_baseline:,}
// subscribers before the last 30 days, 30-day history complete, latest_stat_date within the last
// {STALE_DAYS} days). growthPct = subsGained30d / (subscribers - subsGained30d) * 100.
// Do not hand-edit the numbers here -- rerun the generator instead. The same object feeds the
// human-readable page, /llms-full.txt and the JSON-LD blocks, so a change here changes all three
// at once (no drift between "visible" and "AI-facing" content).

import type {{ YoutubeNicheReport }} from "./youtube-report-types";

export const {niche.export_name}: YoutubeNicheReport = {{
  niche: "{niche.category}",
  region: "global",
  dataAsOf: "{data_as_of}",
  updatedAt: "{updated_at}",
  channels: [
{channels_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightChannel: {{
    channelName: "{ts_escape(top['channelName'])}",
    note: "{highlight_note_escaped}",
  }},
}};
"""


def render_subgenre_ts(subgenre: Subgenre, channels: list[dict], data_as_of: str, updated_at: str) -> str:
    top = channels[0]

    def ts_channel(c: dict) -> str:
        created_at = "null" if c["channelCreatedAt"] is None else f'"{c["channelCreatedAt"]}"'
        return (
            "    {\n"
            f'      channelName: "{ts_escape(c["channelName"])}",\n'
            f'      channelUrl: "{ts_escape(c["channelUrl"])}",\n'
            f'      topic: "{ts_escape(c["topic"])}",\n'
            f'      subscribers: {c["subscribers"]},\n'
            f'      subsGained30d: {c["subsGained30d"]},\n'
            f'      growthPct: {c["growthPct"]},\n'
            f'      viewsGained30d: {c["viewsGained30d"]},\n'
            f"      channelCreatedAt: {created_at},\n"
            "    },"
        )

    channels_ts = "\n".join(ts_channel(c) for c in channels)
    methodology_escaped = ts_escape(subgenre_methodology_note(subgenre.min_subscribers, subgenre.parent_category))
    highlight_note_escaped = ts_escape(highlight_note(top, data_as_of))

    return f"""// Single source of truth for the YouTube {subgenre.subgenre} channel growth report
// (part of {subgenre.parent_category}).
// Generated by scripts/generate-youtube-reports.py from ClickHouse
// `vira_analytics.channels_latest_mat` (topic contains "{subgenre.subgenre}" with at most one
// other YouTube topic tag, subscribers >= {subgenre.min_subscribers:,}, had at least
// {subgenre.min_baseline:,} subscribers before the last 30 days, 30-day history complete,
// latest_stat_date within the last {STALE_DAYS} days). growthPct = subsGained30d /
// (subscribers - subsGained30d) * 100.
// Do not hand-edit the numbers here -- rerun the generator instead. The same object feeds the
// human-readable page, /llms-full.txt and the JSON-LD blocks, so a change here changes all three
// at once (no drift between "visible" and "AI-facing" content).

import type {{ YoutubeSubgenreReport }} from "./youtube-subgenre-report-types";

export const {subgenre.export_name}: YoutubeSubgenreReport = {{
  subgenre: "{ts_escape(subgenre.subgenre)}",
  parentCategory: "{ts_escape(subgenre.parent_category)}",
  parentSlug: "{subgenre.parent_key}",
  region: "global",
  dataAsOf: "{data_as_of}",
  updatedAt: "{updated_at}",
  channels: [
{channels_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightChannel: {{
    channelName: "{ts_escape(top['channelName'])}",
    note: "{highlight_note_escaped}",
  }},
}};
"""


def generate(niche: Niche, out_dir: str, base_url: str, user: str, password: str) -> str:
    channels = fetch_channels(base_url, user, password, niche)
    if len(channels) < MIN_CHANNELS:
        raise ReportError(
            f"only {len(channels)} channels for niche={niche.key} "
            f"(need >= {MIN_CHANNELS}); refusing to publish"
        )

    data_as_of = max(c["latestStatDate"] for c in channels if c["latestStatDate"])
    stale_days = (datetime.now(timezone.utc).date() - datetime.strptime(data_as_of, "%Y-%m-%d").date()).days
    if stale_days > STALE_DAYS:
        raise ReportError(
            f"newest latest_stat_date in selection is {data_as_of} ({stale_days}d old, "
            f"max {STALE_DAYS}d); refusing to publish"
        )

    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    ts_content = render_ts(niche, channels, data_as_of, updated_at)

    out_path = os.path.join(out_dir, niche.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


def generate_subgenre(subgenre: Subgenre, out_dir: str, base_url: str, user: str, password: str) -> str:
    channels = fetch_channels(base_url, user, password, subgenre)
    if len(channels) < MIN_CHANNELS:
        raise ReportError(
            f"only {len(channels)} channels for subgenre={subgenre.key} "
            f"(need >= {MIN_CHANNELS}); refusing to publish"
        )

    data_as_of = max(c["latestStatDate"] for c in channels if c["latestStatDate"])
    stale_days = (datetime.now(timezone.utc).date() - datetime.strptime(data_as_of, "%Y-%m-%d").date()).days
    if stale_days > STALE_DAYS:
        raise ReportError(
            f"newest latest_stat_date in selection is {data_as_of} ({stale_days}d old, "
            f"max {STALE_DAYS}d); refusing to publish"
        )

    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    ts_content = render_subgenre_ts(subgenre, channels, data_as_of, updated_at)

    out_path = os.path.join(out_dir, subgenre.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


# --- --discover (GG-724 auto-discovery, weekly) ------------------------------------------------
# Same idea as scripts/generate-reports.py --discover (TikTok): count the full tag space in
# ClickHouse instead of the fixed manifest list, add anything new that clears the same thresholds
# already used for the 36 niches + 23 subgenres, publish it, and log (without touching the page)
# anything already published that has dropped below threshold. Never removes a published slug.
#
# Unlike TikTok (cat_l1/cat_l2 give the niche/subcategory split for free from the schema), YouTube
# has one flat, comma-joined `topic` field -- there is no structural parent/child link between a
# niche tag and a subgenre tag. The niche/subgenre split made by hand for the current 36+23 was:
# a tag is a subgenre of Music/Gaming if its name contains "music" or "game" (every one of the 13
# music + 10 game subgenres does; neither "Music" nor "Video game culture" themselves do) --
# DISCOVER_* below applies that same substring rule to any future tag, plus the >=8/10 top-10
# overlap check against the parent niche that was used to clear the 23 subgenres for publication
# (see Research/2026-10-07 GG-724 YouTube-поджанры.md).

DISCOVER_TOPICS_QUERY = """
SELECT trim(BOTH ' ' FROM arrayJoin(splitByChar(',', coalesce(topic,'')))) AS single_topic,
       count() AS n
FROM channels_latest_mat FINAL
WHERE length(splitByChar(',', coalesce(topic,''))) <= 2
  AND insufficient_history_30d = 0
  AND insufficient_views_history_30d = 0
  AND subscribers >= {min_subscribers:UInt64}
  AND (subscribers - subs_30d) >= {min_baseline:UInt64}
  AND latest_stat_date >= today() - 3
GROUP BY single_topic
ORDER BY n DESC
FORMAT TSV
"""

# Same >=8/10 "basically a duplicate" bar used when the 23 subgenres were added by hand.
OVERLAP_DUPLICATE_THRESHOLD = 8
MUSIC_PARENT_KEY = "music"
GAMING_PARENT_KEY = "gaming"


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
    # Unlike TikTok's exportName (no product prefix, e.g. "gourmetReport"), every existing
    # YouTube export is "youtube" + PascalCase(slug) + suffix (e.g. "youtubeFoodReport",
    # "youtubePopMusicSubReport") -- match that, not the TikTok convention.
    return "youtube" + "".join(p.capitalize() for p in slug.split("-")) + suffix


def is_music_subgenre_tag(tag: str) -> bool:
    low = tag.strip().lower()
    return low != "music" and "music" in low


def is_game_subgenre_tag(tag: str) -> bool:
    low = tag.strip().lower()
    return low != "video game culture" and "game" in low


def top10_channel_names(base_url: str, user: str, password: str, topic_match: str) -> list[str]:
    # A throwaway Niche just to reuse fetch_channels()'s duck-typed niche.topic_match/
    # min_subscribers/min_baseline lookup -- key/export_name/out_file are never read for this.
    probe = Niche(
        key="__probe__",
        category=topic_match,
        topic_match=topic_match,
        min_subscribers=MIN_SUBSCRIBERS,
        min_baseline=MIN_BASELINE,
        export_name="__probe__",
        out_file="__probe__",
    )
    return [c["channelName"] for c in fetch_channels(base_url, user, password, probe)]


def overlap_with_parent(base_url: str, user: str, password: str, candidate_topic_match: str, parent_topic_match: str) -> int:
    candidate = top10_channel_names(base_url, user, password, candidate_topic_match)
    parent = set(top10_channel_names(base_url, user, password, parent_topic_match))
    return sum(1 for name in candidate if name in parent)


def discover_niches(
    base_url: str,
    user: str,
    password: str,
    tag_counts: dict[str, int],
    existing_niches: dict[str, Niche],
    existing_subgenres: dict[str, Subgenre],
) -> tuple[list[Niche], list[tuple[str, int]]]:
    existing_by_topic = {n.topic_match: key for key, n in existing_niches.items()}
    existing_subgenre_topics = {s.topic_match for s in existing_subgenres.values()}
    taken_slugs = set(existing_niches) | set(existing_subgenres)

    new_niches: list[Niche] = []
    degraded: list[tuple[str, int]] = []
    for tag, n in tag_counts.items():
        if tag == "":
            continue
        existing_key = existing_by_topic.get(tag)
        if existing_key is not None:
            if n < MIN_CHANNELS:
                degraded.append((existing_key, n))
            continue
        if tag in existing_subgenre_topics:
            continue  # already published as a subgenre, not a standalone niche
        if is_music_subgenre_tag(tag) or is_game_subgenre_tag(tag):
            continue  # candidate subgenre, handled by discover_subgenres() instead
        if n < MIN_CHANNELS:
            continue
        slug = unique_slug(slugify(tag), taken_slugs)
        taken_slugs.add(slug)
        new_niches.append(
            Niche(
                key=slug,
                category=tag,
                topic_match=tag,
                min_subscribers=MIN_SUBSCRIBERS,
                min_baseline=MIN_BASELINE,
                export_name=camel_export_name(slug, "Report"),
                out_file=f"youtube-{slug}-report.ts",
            )
        )
    return new_niches, degraded


def discover_subgenres(
    base_url: str,
    user: str,
    password: str,
    tag_counts: dict[str, int],
    existing_subgenres: dict[str, Subgenre],
    niches_by_key: dict[str, Niche],
) -> tuple[list[Subgenre], list[tuple[str, int]]]:
    existing_by_topic = {s.topic_match: key for key, s in existing_subgenres.items()}
    taken_slugs = set(existing_subgenres) | set(niches_by_key)

    new_subgenres: list[Subgenre] = []
    degraded: list[tuple[str, int]] = []
    for tag, n in tag_counts.items():
        if tag == "" or not (is_music_subgenre_tag(tag) or is_game_subgenre_tag(tag)):
            continue
        existing_key = existing_by_topic.get(tag)
        if existing_key is not None:
            if n < MIN_CHANNELS:
                degraded.append((existing_key, n))
            continue
        if n < MIN_CHANNELS:
            continue
        parent_key = MUSIC_PARENT_KEY if is_music_subgenre_tag(tag) else GAMING_PARENT_KEY
        parent = niches_by_key.get(parent_key)
        if parent is None:
            print(
                f"generate-youtube-reports --discover: subgenre candidate {tag!r} has no "
                f"published parent niche {parent_key!r}, skipping",
                file=sys.stderr,
            )
            continue
        overlap = overlap_with_parent(base_url, user, password, tag, parent.topic_match)
        if overlap >= OVERLAP_DUPLICATE_THRESHOLD:
            print(
                f"generate-youtube-reports --discover: subgenre candidate {tag!r} overlaps parent "
                f"{parent.key!r} top-10 by {overlap}/10 (>= {OVERLAP_DUPLICATE_THRESHOLD}), not publishing",
                file=sys.stderr,
            )
            continue
        slug = unique_slug(slugify(tag), taken_slugs)
        taken_slugs.add(slug)
        new_subgenres.append(
            Subgenre(
                key=slug,
                subgenre=tag,
                parent_key=parent.key,
                parent_category=parent.category,
                topic_match=tag,
                min_subscribers=MIN_SUBSCRIBERS,
                min_baseline=MIN_BASELINE,
                export_name=camel_export_name(slug, "SubReport"),
                out_file=f"youtube-sub-{slug}-report.ts",
            )
        )
    return new_subgenres, degraded


def run_discover(out_dir: str, base_url: str, user: str, password: str) -> int:
    try:
        text = ch_query(
            base_url,
            user,
            password,
            DISCOVER_TOPICS_QUERY,
            {"min_subscribers": MIN_SUBSCRIBERS, "min_baseline": MIN_BASELINE},
        )
    except ReportError as e:
        print(f"generate-youtube-reports --discover: topic discovery query failed: {e}", file=sys.stderr)
        return 1

    tag_counts: dict[str, int] = {}
    for row in parse_tsv(text):
        if len(row) != 2:
            continue
        tag_counts[row[0].strip()] = int(row[1])

    new_niches, degraded_niches = discover_niches(base_url, user, password, tag_counts, NICHES, SUBGENRES)
    all_niches = {**NICHES, **{n.key: n for n in new_niches}}
    new_subgenres, degraded_subgenres = discover_subgenres(
        base_url, user, password, tag_counts, SUBGENRES, all_niches
    )

    for niche in new_niches:
        try:
            out_path = generate(niche, out_dir, base_url, user, password)
        except ReportError as e:
            print(f"generate-youtube-reports --discover: new niche={niche.key} failed to publish: {e}", file=sys.stderr)
            continue
        print(f"generate-youtube-reports --discover: published new niche {niche.key} ({out_path})")

    for subgenre in new_subgenres:
        try:
            out_path = generate_subgenre(subgenre, out_dir, base_url, user, password)
        except ReportError as e:
            print(
                f"generate-youtube-reports --discover: new subgenre={subgenre.key} failed to publish: {e}",
                file=sys.stderr,
            )
            continue
        print(f"generate-youtube-reports --discover: published new subgenre {subgenre.key} ({out_path})")

    # Only entries whose report file actually got written go into the manifest -- same "don't
    # publish a broken page" guarantee as the daily run.
    ok_new_niches = [n for n in new_niches if os.path.exists(os.path.join(out_dir, n.out_file))]
    ok_new_subgenres = [s for s in new_subgenres if os.path.exists(os.path.join(out_dir, s.out_file))]

    if ok_new_niches:
        rows = _load_manifest(NICHES_MANIFEST)
        rows += [
            {
                "slug": n.key,
                "category": n.category,
                "topicMatch": n.topic_match,
                "exportName": n.export_name,
                "dataFile": n.out_file,
            }
            for n in ok_new_niches
        ]
        rows.sort(key=lambda r: r["slug"])
        _dump_manifest(NICHES_MANIFEST, rows)

    if ok_new_subgenres:
        rows = _load_manifest(SUBGENRES_MANIFEST)
        rows += [
            {
                "slug": s.key,
                "subgenre": s.subgenre,
                "parentSlug": s.parent_key,
                "parentCategory": s.parent_category,
                "topicMatch": s.topic_match,
                "exportName": s.export_name,
                "dataFile": s.out_file,
            }
            for s in ok_new_subgenres
        ]
        rows.sort(key=lambda r: r["slug"])
        _dump_manifest(SUBGENRES_MANIFEST, rows)

    print(
        "generate-youtube-reports --discover: summary -- "
        f"niches: {len(NICHES)} published, {len(ok_new_niches)} new, {len(degraded_niches)} below threshold today; "
        f"subgenres: {len(SUBGENRES)} published, {len(ok_new_subgenres)} new, "
        f"{len(degraded_subgenres)} below threshold today"
    )
    for key, n in degraded_niches:
        print(f"generate-youtube-reports --discover: niche={key} now has only {n} channels (< {MIN_CHANNELS}); page kept as-is")
    for key, n in degraded_subgenres:
        print(
            f"generate-youtube-reports --discover: subgenre={key} now has only {n} channels "
            f"(< {MIN_CHANNELS}); page kept as-is"
        )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--niche", default="all", choices=sorted(NICHES) + ["all"])
    parser.add_argument("--subgenre", default="all", choices=sorted(SUBGENRES) + ["all"])
    parser.add_argument(
        "--out-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data"),
        help="directory to write <niche>-report.ts / youtube-sub-<slug>-report.ts into (default: repo's src/data)",
    )
    parser.add_argument(
        "--discover",
        action="store_true",
        help=(
            "instead of regenerating the niches/subgenres already in the manifests "
            "(--niche/--subgenre, above), count the full topic-tag space in ClickHouse, add "
            "anything new that clears the same thresholds to the manifests and publish it, and "
            "log anything already published that has dropped below threshold (without touching "
            "its page). Meant for a separate, weekly timer -- does not also run the "
            "--niche/--subgenre regeneration."
        ),
    )
    args = parser.parse_args()

    try:
        base_url = os.environ["CSI_CH_URL"]
        user = os.environ["CSI_CH_USER"]
        password = os.environ["CSI_CH_PASSWORD"]
    except KeyError as e:
        print(f"generate-youtube-reports: missing required env var {e}", file=sys.stderr)
        return 1

    if args.discover:
        return run_discover(args.out_dir, base_url, user, password)

    niches = list(NICHES.values()) if args.niche == "all" else [NICHES[args.niche]]
    subgenres = list(SUBGENRES.values()) if args.subgenre == "all" else [SUBGENRES[args.subgenre]]

    ok_count = 0
    for niche in niches:
        try:
            out_path = generate(niche, args.out_dir, base_url, user, password)
        except ReportError as e:
            print(f"generate-youtube-reports: niche={niche.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-youtube-reports: wrote {out_path}")
        ok_count += 1

    for subgenre in subgenres:
        try:
            out_path = generate_subgenre(subgenre, args.out_dir, base_url, user, password)
        except ReportError as e:
            print(f"generate-youtube-reports: subgenre={subgenre.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-youtube-reports: wrote {out_path}")
        ok_count += 1

    if ok_count == 0:
        print("generate-youtube-reports: every niche and subgenre failed, nothing published", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
