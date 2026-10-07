import type { APIRoute } from "astro";
import { youtubeVehiclesReport } from "../../../../data/youtube-vehicles-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeVehiclesReport, "vehicles"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
