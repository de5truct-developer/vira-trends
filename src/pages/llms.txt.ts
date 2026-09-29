import type { APIRoute } from "astro";
import { gourmetReport } from "../data/gourmet-report";
import { youtubeFoodReport } from "../data/youtube-food-report";

export const prerender = true;

export const GET: APIRoute = () => {
  const { topics, windowEnd, updatedAt } = gourmetReport;
  const top = topics[0];
  const { channels: ytChannels, dataAsOf: ytDataAsOf, updatedAt: ytUpdatedAt } = youtubeFoodReport;
  const ytTop = ytChannels[0];

  const body = `# Vira Trend Reports

> Free, structured reports on the fastest-growing TikTok search topics and YouTube channels by
> niche, built from TikTok Creative Center data and YouTube public channel statistics collected by
> Vira. Updated daily (TikTok) or as noted (YouTube). Published by Vira (https://tryvira.app), a
> TikTok and YouTube analytics platform with an MCP server for AI agents.

## TikTok trend reports
- [Gourmet trends this week](https://trends.tryvira.app/reports/tiktok/gourmet) — ${topics.length} fastest-growing
  Gourmet topics on TikTok, week ending ${windowEnd}, updated ${updatedAt}. Top mover:
  "${top.topic}" (${top.subcategory}), ${top.growthMultiplier}x growth, trust: ${top.trust},
  ${top.videoNum} videos reported, top countries ${top.topCountries.join("/")}.
- Full per-topic facts, plain text: https://trends.tryvira.app/llms-full.txt

## YouTube analytics reports
- [Food channel growth](https://trends.tryvira.app/reports/youtube/food) — ${ytChannels.length} fastest-growing
  YouTube channels in the Food niche, 30-day window ending ${ytDataAsOf}, page updated ${ytUpdatedAt}.
  Top mover: "${ytTop.channelName}" (${ytTop.topic}), +${ytTop.growthPct}% subscribers in 30 days,
  ${ytTop.subscribers.toLocaleString("en-US")} subscribers total.
- Full per-channel facts, plain text: https://trends.tryvira.app/reports/youtube/food/llms-full.txt

## Methodology
- https://trends.tryvira.app/reports/methodology — how growth, trust and video/subscriber counts
  are computed for both TikTok and YouTube reports; TikTok video count 0 means not reported by
  TikTok, not zero competition.

## Vira product
- Main site: https://tryvira.app
- MCP server: https://mcp.tryvira.app/mcp (Streamable HTTP) — TikTok and YouTube analytics tools
  for AI agents, OAuth 2.1 or API key.
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
