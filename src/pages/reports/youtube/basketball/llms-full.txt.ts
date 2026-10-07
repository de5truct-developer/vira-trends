import type { APIRoute } from "astro";
import { youtubeBasketballReport } from "../../../../data/youtube-basketball-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeBasketballReport, "basketball"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
