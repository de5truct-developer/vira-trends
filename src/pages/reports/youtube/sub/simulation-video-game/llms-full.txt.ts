import type { APIRoute } from "astro";
import { youtubeSimulationVideoGameSubReport } from "../../../../../data/youtube-sub-simulation-video-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeSimulationVideoGameSubReport, "simulation-video-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
