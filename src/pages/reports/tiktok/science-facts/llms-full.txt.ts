import type { APIRoute } from "astro";
import { scienceFactsReport } from "../../../../data/tiktok-science-facts-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(scienceFactsReport, "science-facts"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
