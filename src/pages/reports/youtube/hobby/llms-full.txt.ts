import type { APIRoute } from "astro";
import { youtubeHobbyReport } from "../../../../data/youtube-hobby-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeHobbyReport, "hobby"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
