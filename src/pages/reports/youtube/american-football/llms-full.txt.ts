import type { APIRoute } from "astro";
import { youtubeAmericanFootballReport } from "../../../../data/youtube-american-football-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeAmericanFootballReport, "american-football"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
