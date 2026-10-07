import type { APIRoute } from "astro";
import { youtubeIndependentMusicSubReport } from "../../../../../data/youtube-sub-independent-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeIndependentMusicSubReport, "independent-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
