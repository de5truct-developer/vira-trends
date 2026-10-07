import type { APIRoute } from "astro";
import { sportsReport } from "../../../../data/tiktok-sports-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(sportsReport, "sports"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
