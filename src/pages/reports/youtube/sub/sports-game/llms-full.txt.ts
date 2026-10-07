import type { APIRoute } from "astro";
import { youtubeSportsGameSubReport } from "../../../../../data/youtube-sub-sports-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeSportsGameSubReport, "sports-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
