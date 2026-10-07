import type { APIRoute } from "astro";
import { youtubePoliticsReport } from "../../../../data/youtube-politics-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubePoliticsReport, "politics"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
