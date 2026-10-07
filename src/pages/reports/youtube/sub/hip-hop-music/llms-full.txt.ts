import type { APIRoute } from "astro";
import { youtubeHipHopMusicSubReport } from "../../../../../data/youtube-sub-hip-hop-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeHipHopMusicSubReport, "hip-hop-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
