import type { APIRoute } from "astro";
import { youtubeSoulMusicSubReport } from "../../../../../data/youtube-sub-soul-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeSoulMusicSubReport, "soul-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
