import type { APIRoute } from "astro";
import { youtubeRacingVideoGameSubReport } from "../../../../../data/youtube-sub-racing-video-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeRacingVideoGameSubReport, "racing-video-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
