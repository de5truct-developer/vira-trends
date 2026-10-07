import type { APIRoute } from "astro";
import { youtubeSportsReport } from "../../../../data/youtube-sports-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeSportsReport, "sports"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
