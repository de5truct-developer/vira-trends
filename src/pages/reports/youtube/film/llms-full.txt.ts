import type { APIRoute } from "astro";
import { youtubeFilmReport } from "../../../../data/youtube-film-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeFilmReport, "film"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
