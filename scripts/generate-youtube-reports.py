#!/usr/bin/env python3
"""Regenerate src/data/<niche>-report.ts from vira_analytics.channels_latest_mat (GG-724).

Read-only against ClickHouse (SELECT only). Separate pipeline from
generate-reports.py (TikTok/csi) -- different source database and different
upstream refresh schedule. Run daily by vira-trends-youtube-reports.service,
on server vira, well after the stats container's own
refresh_channels_latest_materialized cycle finishes (no fixed cron for that
job -- it floats; see Research note for the timing this was tuned against).

Usage:
    generate-youtube-reports.py [--niche all|food|...] [--out-dir DIR]

`--niche all` (the default) regenerates every niche in NICHES. A bad niche
(too few channels, stale snapshot, failed query) is skipped with an error on
stderr; the other niches in the same run still get published. The whole run
only exits non-zero if every niche failed.

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
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone

import requests

DATABASE = "vira_analytics"
MIN_CHANNELS = 5  # fewer rows than this: refuse to publish, something's wrong upstream
STALE_DAYS = 3  # dataAsOf older than this many days: refuse to publish

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


@dataclass(frozen=True)
class Niche:
    key: str            # CLI --niche value
    category: str       # display name, e.g. "Food"
    topic_match: str    # substring matched against channels_latest_mat.topic
    min_subscribers: int
    min_baseline: int   # minimum (subscribers - subs_30d), excludes from-zero channels
    export_name: str    # exported TS const, e.g. youtubeFoodReport
    out_file: str        # relative to repo src/data/


NICHES: dict[str, Niche] = {
    "food": Niche(
        key="food",
        category="Food",
        topic_match="Food",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeFoodReport",
        out_file="youtube-food-report.ts",
    ),
    "lifestyle": Niche(
        key="lifestyle",
        category="Lifestyle (sociology)",
        topic_match="Lifestyle (sociology)",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeLifestyleReport",
        out_file="youtube-lifestyle-report.ts",
    ),
    "gaming": Niche(
        key="gaming",
        category="Video game culture",
        topic_match="Video game culture",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeGamingReport",
        out_file="youtube-gaming-report.ts",
    ),
    "music": Niche(
        key="music",
        category="Music",
        topic_match="Music",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeMusicReport",
        out_file="youtube-music-report.ts",
    ),
    "entertainment": Niche(
        key="entertainment",
        category="Entertainment",
        topic_match="Entertainment",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeEntertainmentReport",
        out_file="youtube-entertainment-report.ts",
    ),
    "film": Niche(
        key="film",
        category="Film",
        topic_match="Film",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeFilmReport",
        out_file="youtube-film-report.ts",
    ),
    "technology": Niche(
        key="technology",
        category="Technology",
        topic_match="Technology",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeTechnologyReport",
        out_file="youtube-technology-report.ts",
    ),
    "health": Niche(
        key="health",
        category="Health",
        topic_match="Health",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeHealthReport",
        out_file="youtube-health-report.ts",
    ),
    "tourism": Niche(
        key="tourism",
        category="Tourism",
        topic_match="Tourism",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeTourismReport",
        out_file="youtube-tourism-report.ts",
    ),
    "fashion": Niche(
        key="fashion",
        category="Fashion",
        topic_match="Fashion",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeFashionReport",
        out_file="youtube-fashion-report.ts",
    ),
    # Below: GG-724 full-coverage expansion (2026-10-07). Full set of YouTube topicCategories
    # pulled live from vira_analytics.channels_latest_mat (same base filters as CHANNELS_QUERY
    # minus the topic_match itself), not the original 10. See Research note
    # "2026-10-07 GG-724 максимальное покрытие YouTube-ниш.md" for the full counts and the
    # reasoning on what was left out (blank topic, music/video-game subgenres, three sports
    # below MIN_CHANNELS).
    "society": Niche(
        key="society",
        category="Society",
        topic_match="Society",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeSocietyReport",
        out_file="youtube-society-report.ts",
    ),
    "knowledge": Niche(
        key="knowledge",
        category="Knowledge",
        topic_match="Knowledge",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeKnowledgeReport",
        out_file="youtube-knowledge-report.ts",
    ),
    "hobby": Niche(
        key="hobby",
        category="Hobby",
        topic_match="Hobby",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeHobbyReport",
        out_file="youtube-hobby-report.ts",
    ),
    "vehicles": Niche(
        key="vehicles",
        category="Vehicle",
        topic_match="Vehicle",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeVehiclesReport",
        out_file="youtube-vehicles-report.ts",
    ),
    "religion": Niche(
        key="religion",
        category="Religion",
        topic_match="Religion",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeReligionReport",
        out_file="youtube-religion-report.ts",
    ),
    "politics": Niche(
        key="politics",
        category="Politics",
        topic_match="Politics",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubePoliticsReport",
        out_file="youtube-politics-report.ts",
    ),
    "sports": Niche(
        key="sports",
        category="Sport",
        topic_match="Sport",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeSportsReport",
        out_file="youtube-sports-report.ts",
    ),
    "pets": Niche(
        key="pets",
        category="Pet",
        topic_match="Pet",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubePetsReport",
        out_file="youtube-pets-report.ts",
    ),
    "business": Niche(
        key="business",
        category="Business",
        topic_match="Business",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeBusinessReport",
        out_file="youtube-business-report.ts",
    ),
    "military": Niche(
        key="military",
        category="Military",
        topic_match="Military",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeMilitaryReport",
        out_file="youtube-military-report.ts",
    ),
    "humor": Niche(
        key="humor",
        category="Humour",
        topic_match="Humour",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeHumorReport",
        out_file="youtube-humor-report.ts",
    ),
    "performing-arts": Niche(
        key="performing-arts",
        category="Performing arts",
        topic_match="Performing arts",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubePerformingArtsReport",
        out_file="youtube-performing-arts-report.ts",
    ),
    "tv": Niche(
        key="tv",
        category="Television program",
        topic_match="Television program",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeTvReport",
        out_file="youtube-tv-report.ts",
    ),
    "fitness": Niche(
        key="fitness",
        category="Physical fitness",
        topic_match="Physical fitness",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeFitnessReport",
        out_file="youtube-fitness-report.ts",
    ),
    "beauty": Niche(
        key="beauty",
        category="Physical attractiveness",
        topic_match="Physical attractiveness",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeBeautyReport",
        out_file="youtube-beauty-report.ts",
    ),
    "soccer": Niche(
        key="soccer",
        category="Association football",
        topic_match="Association football",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeSoccerReport",
        out_file="youtube-soccer-report.ts",
    ),
    "basketball": Niche(
        key="basketball",
        category="Basketball",
        topic_match="Basketball",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeBasketballReport",
        out_file="youtube-basketball-report.ts",
    ),
    "cricket": Niche(
        key="cricket",
        category="Cricket",
        topic_match="Cricket",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeCricketReport",
        out_file="youtube-cricket-report.ts",
    ),
    "baseball": Niche(
        key="baseball",
        category="Baseball",
        topic_match="Baseball",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeBaseballReport",
        out_file="youtube-baseball-report.ts",
    ),
    "american-football": Niche(
        key="american-football",
        category="American football",
        topic_match="American football",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeAmericanFootballReport",
        out_file="youtube-american-football-report.ts",
    ),
    "ice-hockey": Niche(
        key="ice-hockey",
        category="Ice hockey",
        topic_match="Ice hockey",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeIceHockeyReport",
        out_file="youtube-ice-hockey-report.ts",
    ),
    "tennis": Niche(
        key="tennis",
        category="Tennis",
        topic_match="Tennis",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeTennisReport",
        out_file="youtube-tennis-report.ts",
    ),
    "volleyball": Niche(
        key="volleyball",
        category="Volleyball",
        topic_match="Volleyball",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeVolleyballReport",
        out_file="youtube-volleyball-report.ts",
    ),
    "golf": Niche(
        key="golf",
        category="Golf",
        topic_match="Golf",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeGolfReport",
        out_file="youtube-golf-report.ts",
    ),
    "boxing": Niche(
        key="boxing",
        category="Boxing",
        topic_match="Boxing",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeBoxingReport",
        out_file="youtube-boxing-report.ts",
    ),
    "mma": Niche(
        key="mma",
        category="Mixed martial arts",
        topic_match="Mixed martial arts",
        min_subscribers=50_000,
        min_baseline=20_000,
        export_name="youtubeMmaReport",
        out_file="youtube-mma-report.ts",
    ),
}


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


def fetch_channels(base_url: str, user: str, password: str, niche: Niche) -> list[dict]:
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
    except KeyError as e:
        print(f"generate-youtube-reports: missing required env var {e}", file=sys.stderr)
        return 1

    niches = list(NICHES.values()) if args.niche == "all" else [NICHES[args.niche]]

    ok_count = 0
    for niche in niches:
        try:
            out_path = generate(niche, args.out_dir, base_url, user, password)
        except ReportError as e:
            print(f"generate-youtube-reports: niche={niche.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-youtube-reports: wrote {out_path}")
        ok_count += 1

    if ok_count == 0:
        print("generate-youtube-reports: every niche failed, nothing published", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
