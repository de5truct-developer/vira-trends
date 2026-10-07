import type { APIRoute } from "astro";
import { youtubeRolePlayingVideoGameSubReport } from "../../../../../data/youtube-sub-role-playing-video-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeRolePlayingVideoGameSubReport, "role-playing-video-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
