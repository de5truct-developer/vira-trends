import type { APIRoute } from "astro";
import { gourmetReport } from "../../../../data/gourmet-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(gourmetReport, "gourmet"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
