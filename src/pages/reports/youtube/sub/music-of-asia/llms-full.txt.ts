import type { APIRoute } from "astro";
import { youtubeMusicOfAsiaSubReport } from "../../../../../data/youtube-sub-music-of-asia-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeMusicOfAsiaSubReport, "music-of-asia"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
