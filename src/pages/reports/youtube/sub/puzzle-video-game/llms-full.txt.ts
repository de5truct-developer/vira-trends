import type { APIRoute } from "astro";
import { youtubePuzzleVideoGameSubReport } from "../../../../../data/youtube-sub-puzzle-video-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubePuzzleVideoGameSubReport, "puzzle-video-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
