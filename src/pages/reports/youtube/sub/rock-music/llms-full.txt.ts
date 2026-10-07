import type { APIRoute } from "astro";
import { youtubeRockMusicSubReport } from "../../../../../data/youtube-sub-rock-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeRockMusicSubReport, "rock-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
