import type { APIRoute } from "astro";
import { youtubeHumorReport } from "../../../../data/youtube-humor-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeHumorReport, "humor"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
