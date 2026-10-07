import type { APIRoute } from "astro";
import { youtubeLifestyleReport } from "../../../../data/youtube-lifestyle-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeLifestyleReport, "lifestyle"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
