import type { APIRoute } from "astro";
import { youtubeBeautyReport } from "../../../../data/youtube-beauty-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeBeautyReport, "beauty"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
