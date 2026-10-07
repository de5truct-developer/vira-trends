import type { APIRoute } from "astro";
import { youtubeKnowledgeReport } from "../../../../data/youtube-knowledge-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeKnowledgeReport, "knowledge"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
