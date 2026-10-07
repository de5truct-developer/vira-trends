import type { APIRoute } from "astro";
import { NICHES, COUNTRIES, SUBCATEGORIES, loadNicheReport, loadCountryReport, loadSubcategoryReport } from "../lib/tiktok-data";
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
import type { YoutubeNicheReport } from "../data/youtube-report-types";
import { youtubeMusicOfAsiaSubReport } from "../data/youtube-sub-music-of-asia-report";
import { youtubeElectronicMusicSubReport } from "../data/youtube-sub-electronic-music-report";
import { youtubeHipHopMusicSubReport } from "../data/youtube-sub-hip-hop-music-report";
import { youtubeMusicOfLatinAmericaSubReport } from "../data/youtube-sub-music-of-latin-america-report";
import { youtubePopMusicSubReport } from "../data/youtube-sub-pop-music-report";
import { youtubeRockMusicSubReport } from "../data/youtube-sub-rock-music-report";
import { youtubeClassicalMusicSubReport } from "../data/youtube-sub-classical-music-report";
import { youtubeJazzSubReport } from "../data/youtube-sub-jazz-report";
import { youtubeChristianMusicSubReport } from "../data/youtube-sub-christian-music-report";
import { youtubeCountryMusicSubReport } from "../data/youtube-sub-country-music-report";
import { youtubeReggaeSubReport } from "../data/youtube-sub-reggae-report";
import { youtubeSoulMusicSubReport } from "../data/youtube-sub-soul-music-report";
import { youtubeIndependentMusicSubReport } from "../data/youtube-sub-independent-music-report";
import { youtubeActionGameSubReport } from "../data/youtube-sub-action-game-report";
import { youtubeRolePlayingVideoGameSubReport } from "../data/youtube-sub-role-playing-video-game-report";
import { youtubeSportsGameSubReport } from "../data/youtube-sub-sports-game-report";
import { youtubeSimulationVideoGameSubReport } from "../data/youtube-sub-simulation-video-game-report";
import { youtubePuzzleVideoGameSubReport } from "../data/youtube-sub-puzzle-video-game-report";
import { youtubeRacingVideoGameSubReport } from "../data/youtube-sub-racing-video-game-report";
import { youtubeMusicVideoGameSubReport } from "../data/youtube-sub-music-video-game-report";
import { youtubeActionAdventureGameSubReport } from "../data/youtube-sub-action-adventure-game-report";
import { youtubeStrategyVideoGameSubReport } from "../data/youtube-sub-strategy-video-game-report";
import { youtubeCasualGameSubReport } from "../data/youtube-sub-casual-game-report";
import type { YoutubeSubgenreReport } from "../data/youtube-subgenre-report-types";

export const prerender = true;

// TikTok side (GG-724 auto-discovery): read from the manifests instead of one hand-written
// import per niche/country/subcategory -- see src/lib/tiktok-data.ts.
const TIKTOK_REPORTS = NICHES.map((niche) => ({ slug: niche.slug, report: loadNicheReport(niche) }));
const TIKTOK_COUNTRY_REPORTS = COUNTRIES.map((country) => ({ slug: country.slug, report: loadCountryReport(country) }));
const TIKTOK_SUBCATEGORY_REPORTS = SUBCATEGORIES.map((sub) => ({ slug: sub.slug, report: loadSubcategoryReport(sub) }));

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

const YOUTUBE_SUBGENRE_REPORTS: { slug: string; report: YoutubeSubgenreReport }[] = [
  { slug: "music-of-asia", report: youtubeMusicOfAsiaSubReport },
  { slug: "electronic-music", report: youtubeElectronicMusicSubReport },
  { slug: "hip-hop-music", report: youtubeHipHopMusicSubReport },
  { slug: "music-of-latin-america", report: youtubeMusicOfLatinAmericaSubReport },
  { slug: "pop-music", report: youtubePopMusicSubReport },
  { slug: "rock-music", report: youtubeRockMusicSubReport },
  { slug: "classical-music", report: youtubeClassicalMusicSubReport },
  { slug: "jazz", report: youtubeJazzSubReport },
  { slug: "christian-music", report: youtubeChristianMusicSubReport },
  { slug: "country-music", report: youtubeCountryMusicSubReport },
  { slug: "reggae", report: youtubeReggaeSubReport },
  { slug: "soul-music", report: youtubeSoulMusicSubReport },
  { slug: "independent-music", report: youtubeIndependentMusicSubReport },
  { slug: "action-game", report: youtubeActionGameSubReport },
  { slug: "role-playing-video-game", report: youtubeRolePlayingVideoGameSubReport },
  { slug: "sports-game", report: youtubeSportsGameSubReport },
  { slug: "simulation-video-game", report: youtubeSimulationVideoGameSubReport },
  { slug: "puzzle-video-game", report: youtubePuzzleVideoGameSubReport },
  { slug: "racing-video-game", report: youtubeRacingVideoGameSubReport },
  { slug: "music-video-game", report: youtubeMusicVideoGameSubReport },
  { slug: "action-adventure-game", report: youtubeActionAdventureGameSubReport },
  { slug: "strategy-video-game", report: youtubeStrategyVideoGameSubReport },
  { slug: "casual-game", report: youtubeCasualGameSubReport },
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
