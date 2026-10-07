import type { APIRoute } from "astro";
import { youtubeCricketReport } from "../../../../data/youtube-cricket-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeCricketReport, "cricket"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
