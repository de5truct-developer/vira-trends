import type { APIRoute } from "astro";
import { youtubeChristianMusicSubReport } from "../../../../../data/youtube-sub-christian-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeChristianMusicSubReport, "christian-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
