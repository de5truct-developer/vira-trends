import type { APIRoute } from "astro";
import { youtubeSoccerReport } from "../../../../data/youtube-soccer-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeSoccerReport, "soccer"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
