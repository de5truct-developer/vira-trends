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
import { featuredContentReport } from "../data/tiktok-featured-content-report";
import { workplaceReport } from "../data/tiktok-workplace-report";
import { localLifeReport } from "../data/tiktok-local-life-report";
import { acgnReport } from "../data/tiktok-acgn-report";
import { scienceFactsReport } from "../data/tiktok-science-facts-report";
import { entertainmentReport } from "../data/tiktok-entertainment-report";
import { relationshipsReport } from "../data/tiktok-relationships-report";
import { cultureReport } from "../data/tiktok-culture-report";
import { healthcareReport } from "../data/tiktok-healthcare-report";
import { parentingReport } from "../data/tiktok-parenting-report";
import { financeReport } from "../data/tiktok-finance-report";
import { musicReport } from "../data/tiktok-music-report";
import { mediaAccountsReport } from "../data/tiktok-media-accounts-report";
import { societyReport } from "../data/tiktok-society-report";
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
import { youtubeSocietyReport } from "../data/youtube-society-report";
import { youtubeKnowledgeReport } from "../data/youtube-knowledge-report";
import { youtubeHobbyReport } from "../data/youtube-hobby-report";
import { youtubeVehiclesReport } from "../data/youtube-vehicles-report";
import { youtubeReligionReport } from "../data/youtube-religion-report";
import { youtubePoliticsReport } from "../data/youtube-politics-report";
import { youtubeSportsReport } from "../data/youtube-sports-report";
import { youtubePetsReport } from "../data/youtube-pets-report";
import { youtubeBusinessReport } from "../data/youtube-business-report";
import { youtubeMilitaryReport } from "../data/youtube-military-report";
import { youtubeHumorReport } from "../data/youtube-humor-report";
import { youtubePerformingArtsReport } from "../data/youtube-performing-arts-report";
import { youtubeTvReport } from "../data/youtube-tv-report";
import { youtubeFitnessReport } from "../data/youtube-fitness-report";
import { youtubeBeautyReport } from "../data/youtube-beauty-report";
import { youtubeSoccerReport } from "../data/youtube-soccer-report";
import { youtubeBasketballReport } from "../data/youtube-basketball-report";
import { youtubeCricketReport } from "../data/youtube-cricket-report";
import { youtubeBaseballReport } from "../data/youtube-baseball-report";
import { youtubeAmericanFootballReport } from "../data/youtube-american-football-report";
import { youtubeIceHockeyReport } from "../data/youtube-ice-hockey-report";
import { youtubeTennisReport } from "../data/youtube-tennis-report";
import { youtubeVolleyballReport } from "../data/youtube-volleyball-report";
import { youtubeGolfReport } from "../data/youtube-golf-report";
import { youtubeBoxingReport } from "../data/youtube-boxing-report";
import { youtubeMmaReport } from "../data/youtube-mma-report";
import type { TikTokReport } from "../data/tiktok-report-types";
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
  { slug: "featured-content", report: featuredContentReport },
  { slug: "workplace", report: workplaceReport },
  { slug: "local-life", report: localLifeReport },
  { slug: "acgn", report: acgnReport },
  { slug: "science-facts", report: scienceFactsReport },
  { slug: "entertainment", report: entertainmentReport },
  { slug: "relationships", report: relationshipsReport },
  { slug: "culture", report: cultureReport },
  { slug: "healthcare", report: healthcareReport },
  { slug: "parenting", report: parentingReport },
  { slug: "finance", report: financeReport },
  { slug: "music", report: musicReport },
  { slug: "media-accounts", report: mediaAccountsReport },
  { slug: "society", report: societyReport },
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
  { slug: "society", report: youtubeSocietyReport },
  { slug: "knowledge", report: youtubeKnowledgeReport },
  { slug: "hobby", report: youtubeHobbyReport },
  { slug: "vehicles", report: youtubeVehiclesReport },
  { slug: "religion", report: youtubeReligionReport },
  { slug: "politics", report: youtubePoliticsReport },
  { slug: "sports", report: youtubeSportsReport },
  { slug: "pets", report: youtubePetsReport },
  { slug: "business", report: youtubeBusinessReport },
  { slug: "military", report: youtubeMilitaryReport },
  { slug: "humor", report: youtubeHumorReport },
  { slug: "performing-arts", report: youtubePerformingArtsReport },
  { slug: "tv", report: youtubeTvReport },
  { slug: "fitness", report: youtubeFitnessReport },
  { slug: "beauty", report: youtubeBeautyReport },
  { slug: "soccer", report: youtubeSoccerReport },
  { slug: "basketball", report: youtubeBasketballReport },
  { slug: "cricket", report: youtubeCricketReport },
  { slug: "baseball", report: youtubeBaseballReport },
  { slug: "american-football", report: youtubeAmericanFootballReport },
  { slug: "ice-hockey", report: youtubeIceHockeyReport },
  { slug: "tennis", report: youtubeTennisReport },
  { slug: "volleyball", report: youtubeVolleyballReport },
  { slug: "golf", report: youtubeGolfReport },
  { slug: "boxing", report: youtubeBoxingReport },
  { slug: "mma", report: youtubeMmaReport },
];

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

  const body = `# Vira Trend Reports

> Free, structured reports on the fastest-growing TikTok search topics and YouTube channels by
> niche, built from TikTok Creative Center data and YouTube public channel statistics collected by
> Vira. Updated daily. Published by Vira (https://tryvira.app), a TikTok and YouTube analytics
> platform with an MCP server for AI agents.

## TikTok trend reports
${tiktokLines.join("\n")}
- Full index, plain text, all niches: https://trends.tryvira.app/llms-full.txt

## YouTube analytics reports
${youtubeLines.join("\n")}
- Full index, plain text, all niches: https://trends.tryvira.app/llms-full.txt

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
