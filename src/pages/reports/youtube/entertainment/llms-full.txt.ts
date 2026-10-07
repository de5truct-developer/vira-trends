import type { APIRoute } from "astro";
import { youtubeEntertainmentReport } from "../../../../data/youtube-entertainment-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeEntertainmentReport, "entertainment"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
