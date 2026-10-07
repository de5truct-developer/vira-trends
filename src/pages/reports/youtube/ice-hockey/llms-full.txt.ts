import type { APIRoute } from "astro";
import { youtubeIceHockeyReport } from "../../../../data/youtube-ice-hockey-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeIceHockeyReport, "ice-hockey"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
