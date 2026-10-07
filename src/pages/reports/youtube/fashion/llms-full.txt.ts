import type { APIRoute } from "astro";
import { youtubeFashionReport } from "../../../../data/youtube-fashion-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeFashionReport, "fashion"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
