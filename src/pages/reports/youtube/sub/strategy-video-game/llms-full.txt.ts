import type { APIRoute } from "astro";
import { youtubeStrategyVideoGameSubReport } from "../../../../../data/youtube-sub-strategy-video-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeStrategyVideoGameSubReport, "strategy-video-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
