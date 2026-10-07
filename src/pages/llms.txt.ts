import type { APIRoute } from "astro";
import { NICHES, COUNTRIES, SUBCATEGORIES, loadNicheReport, loadCountryReport, loadSubcategoryReport } from "../lib/tiktok-data";
import {
  NICHES as YOUTUBE_NICHES,
  SUBGENRES as YOUTUBE_SUBGENRES,
  loadNicheReport as loadYouTubeNicheReport,
  loadSubgenreReport,
} from "../lib/youtube-data";

export const prerender = true;

// TikTok side (GG-724 auto-discovery): read from the manifests instead of one hand-written
// import per niche/country/subcategory -- see src/lib/tiktok-data.ts.
const TIKTOK_REPORTS = NICHES.map((niche) => ({ slug: niche.slug, report: loadNicheReport(niche) }));
const TIKTOK_COUNTRY_REPORTS = COUNTRIES.map((country) => ({ slug: country.slug, report: loadCountryReport(country) }));
const TIKTOK_SUBCATEGORY_REPORTS = SUBCATEGORIES.map((sub) => ({ slug: sub.slug, report: loadSubcategoryReport(sub) }));

// YouTube side (GG-724 auto-discovery): same idea -- see src/lib/youtube-data.ts.
const YOUTUBE_REPORTS = YOUTUBE_NICHES.map((niche) => ({ slug: niche.slug, report: loadYouTubeNicheReport(niche) }));
const YOUTUBE_SUBGENRE_REPORTS = YOUTUBE_SUBGENRES.map((sub) => ({ slug: sub.slug, report: loadSubgenreReport(sub) }));

export const GET: APIRoute = () => {
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

  const countryLines = TIKTOK_COUNTRY_REPORTS.map(({ slug, report }) => {
    const top = report.topics[0];
    return (
      `- [TikTok trends in ${report.country}](https://trends.tryvira.app/reports/tiktok/country/${slug}) — ` +
      `${report.topics.length} fastest-growing TikTok topics in ${report.country} across all categories, ` +
      `week ending ${report.windowEnd}, updated ${report.updatedAt}. Top mover: "${top.topic}" (${top.category}), ` +
      `${top.growthMultiplier}x growth, trust: ${top.trust}, ` +
      `${top.videoNum === null ? "not reported" : `${top.videoNum} videos reported`}. Full facts: ` +
      `https://trends.tryvira.app/reports/tiktok/country/${slug}/llms-full.txt`
    );
  });

  const subcategoryLines = TIKTOK_SUBCATEGORY_REPORTS.map(({ slug, report }) => {
    const top = report.topics[0];
    return (
      `- [${report.subcategory} trends (part of ${report.parentCategory})](https://trends.tryvira.app/reports/tiktok/sub/${slug}) — ` +
      `${report.topics.length} fastest-growing ${report.subcategory} topics on TikTok, week ending ` +
      `${report.windowEnd}, updated ${report.updatedAt}. Top mover: "${top.topic}", ` +
      `${top.growthMultiplier}x growth, trust: ${top.trust}, ` +
      `${top.videoNum === null ? "not reported" : `${top.videoNum} videos reported`}, ` +
      `top countries ${top.topCountries.join("/")}. Full facts: ` +
      `https://trends.tryvira.app/reports/tiktok/sub/${slug}/llms-full.txt`
    );
  });

  const youtubeLines = YOUTUBE_REPORTS.map(({ slug, report }) => {
    const top = report.channels[0];
    return (
      `- [${report.niche} channel growth](https://trends.tryvira.app/reports/youtube/${slug}) — ` +
      `${report.channels.length} fastest-growing YouTube channels in the ${report.niche} niche, ` +
      `30-day window ending ${report.dataAsOf}, page updated ${report.updatedAt}. Top mover: ` +
      `"${top.channelName}" (${top.topic}), +${top.growthPct}% subscribers in 30 days, ` +
      `${top.subscribers.toLocaleString("en-US")} subscribers total. Full facts: ` +
      `https://trends.tryvira.app/reports/youtube/${slug}/llms-full.txt`
    );
  });

  const subgenreLines = YOUTUBE_SUBGENRE_REPORTS.map(({ slug, report }) => {
    const top = report.channels[0];
    return (
      `- [${report.subgenre} channel growth (part of ${report.parentCategory})](https://trends.tryvira.app/reports/youtube/sub/${slug}) — ` +
      `${report.channels.length} fastest-growing YouTube channels tagged ${report.subgenre}, ` +
      `30-day window ending ${report.dataAsOf}, page updated ${report.updatedAt}. Top mover: ` +
      `"${top.channelName}" (${top.topic}), +${top.growthPct}% subscribers in 30 days, ` +
      `${top.subscribers.toLocaleString("en-US")} subscribers total. Full facts: ` +
      `https://trends.tryvira.app/reports/youtube/sub/${slug}/llms-full.txt`
    );
  });

  const body = `# Vira Trend Reports

> Free, structured reports on the fastest-growing TikTok search topics and YouTube channels by
> niche, built from TikTok Creative Center data and YouTube public channel statistics collected by
> Vira. Updated daily. Published by Vira (https://tryvira.app), a TikTok and YouTube analytics
> platform with an MCP server for AI agents.

## TikTok trend reports (by niche)
${tiktokLines.join("\n")}
- Full index, plain text, all niches: https://trends.tryvira.app/llms-full.txt

## TikTok trend reports (by country)
> Same growth methodology, but mixing every category to show what's trending in one country.
${countryLines.join("\n")}
- Full index, plain text, all countries: https://trends.tryvira.app/llms-full.txt

## TikTok trend reports (by subcategory)
> Same growth methodology, but narrowed to one subcategory nested inside one of the niches above
> (TikTok's own two-level category taxonomy).
${subcategoryLines.join("\n")}
- Full index, plain text, all subcategories: https://trends.tryvira.app/llms-full.txt

## YouTube analytics reports
${youtubeLines.join("\n")}
- Full index, plain text, all niches: https://trends.tryvira.app/llms-full.txt

## YouTube analytics reports (by subgenre)
> Same growth methodology, but narrowed to one topic tag nested inside the Music or Gaming
> niche above (YouTube's own topicCategories).
${subgenreLines.join("\n")}
- Full index, plain text, all subgenres: https://trends.tryvira.app/llms-full.txt

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
