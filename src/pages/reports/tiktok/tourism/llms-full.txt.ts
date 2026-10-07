import type { APIRoute } from "astro";
import { tourismReport } from "../../../../data/tiktok-tourism-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(tourismReport, "tourism"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
