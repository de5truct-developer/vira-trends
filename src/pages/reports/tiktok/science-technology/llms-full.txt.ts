import type { APIRoute } from "astro";
import { scienceTechnologyReport } from "../../../../data/tiktok-science-technology-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(scienceTechnologyReport, "science-technology"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
