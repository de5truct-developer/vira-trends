import type { APIRoute } from "astro";
import { youtubeTourismReport } from "../../../../data/youtube-tourism-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeTourismReport, "tourism"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
