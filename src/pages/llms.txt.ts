import type { APIRoute } from "astro";
import { gourmetReport } from "../data/gourmet-report";
import { scienceTechnologyReport } from "../data/tiktok-science-technology-report";
import { fashionReport } from "../data/tiktok-fashion-report";
import { hobbiesReport } from "../data/tiktok-hobbies-report";
import { sportsReport } from "../data/tiktok-sports-report";
import { vehiclesReport } from "../data/tiktok-vehicles-report";
import { householdReport } from "../data/tiktok-household-report";
import { tourismReport } from "../data/tiktok-tourism-report";
import { educationReport } from "../data/tiktok-education-report";
import { danceReport } from "../data/tiktok-dance-report";
import { youtubeFoodReport } from "../data/youtube-food-report";
import type { TikTokReport } from "../data/tiktok-report-types";

export const prerender = true;

const TIKTOK_REPORTS: { slug: string; report: TikTokReport }[] = [
  { slug: "gourmet", report: gourmetReport },
  { slug: "science-technology", report: scienceTechnologyReport },
  { slug: "fashion", report: fashionReport },
  { slug: "hobbies", report: hobbiesReport },
  { slug: "sports", report: sportsReport },
  { slug: "vehicles", report: vehiclesReport },
  { slug: "household", report: householdReport },
  { slug: "tourism", report: tourismReport },
  { slug: "education", report: educationReport },
  { slug: "dance", report: danceReport },
];

export const GET: APIRoute = () => {
  const { channels: ytChannels, dataAsOf: ytDataAsOf, updatedAt: ytUpdatedAt } = youtubeFoodReport;
  const ytTop = ytChannels[0];

  const tiktokLines = TIKTOK_REPORTS.map(({ slug, report }) => {
    const top = report.topics[0];
    return (
      `- [${report.category} trends this week](https://trends.tryvira.app/reports/tiktok/${slug}) — ` +
      `${report.topics.length} fastest-growing ${report.category} topics on TikTok, week ending ` +
      `${report.windowEnd}, updated ${report.updatedAt}. Top mover: "${top.topic}" (${top.subcategory}), ` +
      `${top.growthMultiplier}x growth, trust: ${top.trust}, ` +
      `${top.videoNum === null ? "not reported" : `${top.videoNum} videos reported`}, ` +
      `top countries ${top.topCountries.join("/")}. Full facts: ` +
      `https://trends.tryvira.app/reports/tiktok/${slug}/llms-full.txt`
    );
  });

  const body = `# Vira Trend Reports

> Free, structured reports on the fastest-growing TikTok search topics and YouTube channels by
> niche, built from TikTok Creative Center data and YouTube public channel statistics collected by
> Vira. Updated daily (TikTok) or as noted (YouTube). Published by Vira (https://tryvira.app), a
> TikTok and YouTube analytics platform with an MCP server for AI agents.

## TikTok trend reports
${tiktokLines.join("\n")}
- Full index, plain text, all niches: https://trends.tryvira.app/llms-full.txt

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
