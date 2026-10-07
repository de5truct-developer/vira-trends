import type { APIRoute } from "astro";
import { youtubeMusicReport } from "../../../../data/youtube-music-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeMusicReport, "music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
