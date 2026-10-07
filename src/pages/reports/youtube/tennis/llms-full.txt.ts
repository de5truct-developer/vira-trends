import type { APIRoute } from "astro";
import { youtubeTennisReport } from "../../../../data/youtube-tennis-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeTennisReport, "tennis"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
