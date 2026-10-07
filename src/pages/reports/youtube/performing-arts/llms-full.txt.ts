import type { APIRoute } from "astro";
import { youtubePerformingArtsReport } from "../../../../data/youtube-performing-arts-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubePerformingArtsReport, "performing-arts"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
