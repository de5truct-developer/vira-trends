import type { APIRoute } from "astro";
import { financeReport } from "../../../../data/tiktok-finance-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(financeReport, "finance"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
