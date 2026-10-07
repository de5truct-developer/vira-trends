import type { APIRoute } from "astro";
import { youtubeBusinessReport } from "../../../../data/youtube-business-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeBusinessReport, "business"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
