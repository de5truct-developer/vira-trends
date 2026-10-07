import type { APIRoute } from "astro";
import { youtubePopMusicSubReport } from "../../../../../data/youtube-sub-pop-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubePopMusicSubReport, "pop-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
