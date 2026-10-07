import type { APIRoute } from "astro";
import {
  NICHES,
  COUNTRIES,
  SUBCATEGORIES,
  loadNicheReport,
  loadCountryReport,
  loadSubcategoryReport,
} from "../lib/tiktok-data";
import { renderTikTokLlmsFull } from "../lib/tiktok-llms-full";
import { renderTikTokCountryLlmsFull } from "../lib/tiktok-country-llms-full";
import { renderTikTokSubcategoryLlmsFull } from "../lib/tiktok-subcategory-llms-full";
import {
  NICHES as YOUTUBE_NICHES,
  SUBGENRES as YOUTUBE_SUBGENRES,
  loadNicheReport as loadYouTubeNicheReport,
  loadSubgenreReport,
} from "../lib/youtube-data";
import { renderYouTubeLlmsFull } from "../lib/youtube-llms-full";
import { renderYouTubeSubgenreLlmsFull } from "../lib/youtube-subgenre-llms-full";

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
  const tiktokSections = TIKTOK_REPORTS.map(({ slug, report }) => renderTikTokLlmsFull(report, slug));
  const countrySections = TIKTOK_COUNTRY_REPORTS.map(({ slug, report }) =>
    renderTikTokCountryLlmsFull(report, slug)
  );
  const subcategorySections = TIKTOK_SUBCATEGORY_REPORTS.map(({ slug, report }) =>
    renderTikTokSubcategoryLlmsFull(report, slug)
  );
  const youtubeSections = YOUTUBE_REPORTS.map(({ slug, report }) => renderYouTubeLlmsFull(report, slug));
  const youtubeSubgenreSections = YOUTUBE_SUBGENRE_REPORTS.map(({ slug, report }) =>
    renderYouTubeSubgenreLlmsFull(report, slug)
  );

  const body = `# Vira Trend Reports — llms-full.txt
# Full per-topic/per-channel facts for every TikTok niche (${TIKTOK_REPORTS.length}), TikTok
# country (${TIKTOK_COUNTRY_REPORTS.length}), TikTok subcategory (${TIKTOK_SUBCATEGORY_REPORTS.length}),
# YouTube niche (${YOUTUBE_REPORTS.length}) and YouTube subgenre (${YOUTUBE_SUBGENRE_REPORTS.length}) report
# below. Each also has its own llms-full.txt at
# https://trends.tryvira.app/reports/tiktok/<slug>/llms-full.txt,
# https://trends.tryvira.app/reports/tiktok/country/<slug>/llms-full.txt,
# https://trends.tryvira.app/reports/tiktok/sub/<slug>/llms-full.txt,
# https://trends.tryvira.app/reports/youtube/<slug>/llms-full.txt or
# https://trends.tryvira.app/reports/youtube/sub/<slug>/llms-full.txt with the same content as
# its section here. One source of truth: numbers here match the visible pages and the JSON-LD
# Dataset blocks on each page.

${tiktokSections.join("\n")}
${countrySections.join("\n")}
${subcategorySections.join("\n")}
${youtubeSections.join("\n")}
${youtubeSubgenreSections.join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
