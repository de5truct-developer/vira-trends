import type { APIRoute } from "astro";
import { cultureReport } from "../../../../data/tiktok-culture-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(cultureReport, "culture"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
