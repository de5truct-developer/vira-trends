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
import { renderTikTokLlmsFull } from "../lib/tiktok-llms-full";
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
  const sections = TIKTOK_REPORTS.map(({ slug, report }) => renderTikTokLlmsFull(report, slug));

  const body = `# Vira Trend Reports — llms-full.txt
# Full per-topic facts for every TikTok niche report (10 niches below). Each niche also has its
# own llms-full.txt at https://trends.tryvira.app/reports/tiktok/<slug>/llms-full.txt with the
# same content as its section here. One source of truth: numbers here match the visible pages
# and the JSON-LD Dataset blocks on each page.
# YouTube reports have their own llms-full.txt, e.g.
# https://trends.tryvira.app/reports/youtube/food/llms-full.txt — see /llms.txt for the full index.

${sections.join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
