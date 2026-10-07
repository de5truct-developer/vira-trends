import type { APIRoute } from "astro";
import { healthcareReport } from "../../../../data/tiktok-healthcare-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(healthcareReport, "healthcare"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
