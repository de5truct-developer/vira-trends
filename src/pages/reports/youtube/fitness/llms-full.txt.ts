import type { APIRoute } from "astro";
import { youtubeFitnessReport } from "../../../../data/youtube-fitness-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeFitnessReport, "fitness"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
