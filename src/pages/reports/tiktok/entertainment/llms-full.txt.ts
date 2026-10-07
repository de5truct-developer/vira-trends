import type { APIRoute } from "astro";
import { entertainmentReport } from "../../../../data/tiktok-entertainment-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(entertainmentReport, "entertainment"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
