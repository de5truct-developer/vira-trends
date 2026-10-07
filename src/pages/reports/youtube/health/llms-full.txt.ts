import type { APIRoute } from "astro";
import { youtubeHealthReport } from "../../../../data/youtube-health-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeHealthReport, "health"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
