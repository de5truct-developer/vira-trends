import type { APIRoute } from "astro";
import { youtubeBoxingReport } from "../../../../data/youtube-boxing-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeBoxingReport, "boxing"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
