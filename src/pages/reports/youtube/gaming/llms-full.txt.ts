import type { APIRoute } from "astro";
import { youtubeGamingReport } from "../../../../data/youtube-gaming-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeGamingReport, "gaming"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
