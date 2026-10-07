import type { APIRoute } from "astro";
import { fashionReport } from "../../../../data/tiktok-fashion-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(fashionReport, "fashion"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
