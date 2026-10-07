import type { APIRoute } from "astro";
import { youtubeReligionReport } from "../../../../data/youtube-religion-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeReligionReport, "religion"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
