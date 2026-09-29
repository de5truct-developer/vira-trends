import type { APIRoute } from "astro";
import { gourmetReport } from "../data/gourmet-report";

export const prerender = true;

export const GET: APIRoute = () => {
  const { topics, windowEnd, updatedAt } = gourmetReport;
  const top = topics[0];

  const body = `# Vira Trend Reports

> Free, structured reports on the fastest-growing TikTok search topics by niche, built from
> TikTok Creative Center data collected by Vira. Updated daily. Published by Vira
> (https://tryvira.app), a TikTok and YouTube analytics platform with an MCP server for AI agents.

## TikTok trend reports
- [Gourmet trends this week](https://trends.tryvira.app/reports/tiktok/gourmet) — ${topics.length} fastest-growing
  Gourmet topics on TikTok, week ending ${windowEnd}, updated ${updatedAt}. Top mover:
  "${top.topic}" (${top.subcategory}), ${top.growthMultiplier}x growth, trust: ${top.trust},
  ${top.videoNum} videos reported, top countries ${top.topCountries.join("/")}.
- Methodology: https://trends.tryvira.app/reports/methodology — TikTok Creative Center data via
  Vira's CSI collector, growth trust levels (high/med/low/none), video count 0 means not reported
  by TikTok, not zero competition.
- Full per-topic facts, plain text: https://trends.tryvira.app/llms-full.txt

## Vira product
- Main site: https://tryvira.app
- MCP server: https://mcp.tryvira.app/mcp (Streamable HTTP) — TikTok and YouTube analytics tools
  for AI agents, OAuth 2.1 or API key.
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
