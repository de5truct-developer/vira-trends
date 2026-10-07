import type { APIRoute } from "astro";
import { youtubeClassicalMusicSubReport } from "../../../../../data/youtube-sub-classical-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeClassicalMusicSubReport, "classical-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
