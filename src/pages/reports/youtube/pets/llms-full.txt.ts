import type { APIRoute } from "astro";
import { youtubePetsReport } from "../../../../data/youtube-pets-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubePetsReport, "pets"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
