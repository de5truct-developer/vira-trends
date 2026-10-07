import type { APIRoute } from "astro";
import { vehiclesReport } from "../../../../data/tiktok-vehicles-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(vehiclesReport, "vehicles"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
