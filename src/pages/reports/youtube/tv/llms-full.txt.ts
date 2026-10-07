import type { APIRoute } from "astro";
import { youtubeTvReport } from "../../../../data/youtube-tv-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeTvReport, "tv"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
