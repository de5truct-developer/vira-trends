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
import { youtubeFoodReport } from "../data/youtube-food-report";
import { youtubeLifestyleReport } from "../data/youtube-lifestyle-report";
import { youtubeGamingReport } from "../data/youtube-gaming-report";
import { youtubeMusicReport } from "../data/youtube-music-report";
import { youtubeEntertainmentReport } from "../data/youtube-entertainment-report";
import { youtubeFilmReport } from "../data/youtube-film-report";
import { youtubeTechnologyReport } from "../data/youtube-technology-report";
import { youtubeHealthReport } from "../data/youtube-health-report";
import { youtubeTourismReport } from "../data/youtube-tourism-report";
import { youtubeFashionReport } from "../data/youtube-fashion-report";
import { renderYouTubeLlmsFull } from "../lib/youtube-llms-full";
import type { YoutubeNicheReport } from "../data/youtube-report-types";

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

const YOUTUBE_REPORTS: { slug: string; report: YoutubeNicheReport }[] = [
  { slug: "food", report: youtubeFoodReport },
  { slug: "lifestyle", report: youtubeLifestyleReport },
  { slug: "gaming", report: youtubeGamingReport },
  { slug: "music", report: youtubeMusicReport },
  { slug: "entertainment", report: youtubeEntertainmentReport },
  { slug: "film", report: youtubeFilmReport },
  { slug: "technology", report: youtubeTechnologyReport },
  { slug: "health", report: youtubeHealthReport },
  { slug: "tourism", report: youtubeTourismReport },
  { slug: "fashion", report: youtubeFashionReport },
];

export const GET: APIRoute = () => {
  const tiktokSections = TIKTOK_REPORTS.map(({ slug, report }) => renderTikTokLlmsFull(report, slug));
  const youtubeSections = YOUTUBE_REPORTS.map(({ slug, report }) => renderYouTubeLlmsFull(report, slug));

  const body = `# Vira Trend Reports — llms-full.txt
# Full per-topic/per-channel facts for every TikTok and YouTube niche report (10 niches each
# below). Each niche also has its own llms-full.txt at
# https://trends.tryvira.app/reports/tiktok/<slug>/llms-full.txt or
# https://trends.tryvira.app/reports/youtube/<slug>/llms-full.txt with the same content as its
# section here. One source of truth: numbers here match the visible pages and the JSON-LD
# Dataset blocks on each page.

${tiktokSections.join("\n")}
${youtubeSections.join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
