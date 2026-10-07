import type { APIRoute } from "astro";
import { youtubeActionAdventureGameSubReport } from "../../../../../data/youtube-sub-action-adventure-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeActionAdventureGameSubReport, "action-adventure-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
