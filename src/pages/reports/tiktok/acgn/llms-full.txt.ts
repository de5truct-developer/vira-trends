import type { APIRoute } from "astro";
import { acgnReport } from "../../../../data/tiktok-acgn-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(acgnReport, "acgn"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
