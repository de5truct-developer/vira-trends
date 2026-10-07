import type { APIRoute } from "astro";
import { youtubeSocietyReport } from "../../../../data/youtube-society-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeSocietyReport, "society"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
