import type { YoutubeSubgenreReport } from "../data/youtube-subgenre-report-types";

// Shared body for every /reports/youtube/sub/<slug>/llms-full.txt route (GG-724 subgenre
// expansion), so the per-subgenre routes don't each re-implement the same formatting.
export function renderYouTubeSubgenreLlmsFull(report: YoutubeSubgenreReport, slug: string): string {
  const { channels, subgenre, parentCategory, parentSlug, region, dataAsOf, updatedAt, methodologyNote } = report;

  const lines = channels.map((c, i) => {
    return (
      `${i + 1}. channel: ${c.channelName}\n` +
      `   url: ${c.channelUrl}\n` +
      `   topic: ${c.topic}\n` +
      `   subscribers: ${c.subscribers}\n` +
      `   subscribers_gained_30d: ${c.subsGained30d}\n` +
      `   growth_pct_30d: ${c.growthPct}%\n` +
      `   views_gained_30d: ${c.viewsGained30d}\n` +
      `   channel_created_at: ${c.channelCreatedAt ?? "unknown"}\n`
    );
  });

  return `# Vira Trend Reports — llms-full.txt
# Full per-channel facts backing https://trends.tryvira.app/reports/youtube/sub/${slug}
# One source of truth: numbers here match the visible page and the JSON-LD Dataset on that page.
# See /llms.txt for the full index of TikTok and YouTube reports.

report: YouTube ${subgenre} channel growth (part of ${parentCategory})
parent_category: ${parentCategory} (https://trends.tryvira.app/reports/youtube/${parentSlug})
region: ${region}
data_as_of: ${dataAsOf}
page_updated: ${updatedAt}
methodology: https://trends.tryvira.app/reports/methodology
methodology_note: ${methodologyNote}

## Channels (ranked by 30-day subscriber growth %, highest first)

${lines.join("\n")}
`;
}
