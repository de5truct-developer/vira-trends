import type { APIRoute } from "astro";
import { youtubeMilitaryReport } from "../../../../data/youtube-military-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeMilitaryReport, "military"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
