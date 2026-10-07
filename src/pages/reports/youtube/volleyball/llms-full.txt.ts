import type { APIRoute } from "astro";
import { youtubeVolleyballReport } from "../../../../data/youtube-volleyball-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeVolleyballReport, "volleyball"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
