import type { APIRoute } from "astro";
import { youtubeActionGameSubReport } from "../../../../../data/youtube-sub-action-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeActionGameSubReport, "action-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
