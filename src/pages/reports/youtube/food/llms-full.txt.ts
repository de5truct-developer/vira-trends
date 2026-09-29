import type { APIRoute } from "astro";
import { youtubeFoodReport } from "../../../../data/youtube-food-report";

export const prerender = true;

export const GET: APIRoute = () => {
  const { channels, region, dataAsOf, updatedAt, methodologyNote } = youtubeFoodReport;

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

  const body = `# Vira Trend Reports — llms-full.txt
# Full per-channel facts backing https://trends.tryvira.app/reports/youtube/food
# One source of truth: numbers here match the visible page and the JSON-LD Dataset on that page.

report: YouTube Food channel growth
region: ${region}
data_as_of: ${dataAsOf}
page_updated: ${updatedAt}
methodology: https://trends.tryvira.app/reports/methodology
methodology_note: ${methodologyNote}

## Channels (ranked by 30-day subscriber growth %, highest first)

${lines.join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
