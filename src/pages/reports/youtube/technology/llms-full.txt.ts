import type { APIRoute } from "astro";
import { youtubeTechnologyReport } from "../../../../data/youtube-technology-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeTechnologyReport, "technology"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
