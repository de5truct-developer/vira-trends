import type { APIRoute } from "astro";
import { youtubeGolfReport } from "../../../../data/youtube-golf-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeGolfReport, "golf"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
