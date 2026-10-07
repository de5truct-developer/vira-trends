import type { APIRoute } from "astro";
import { societyReport } from "../../../../data/tiktok-society-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(societyReport, "society"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
