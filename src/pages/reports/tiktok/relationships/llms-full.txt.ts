import type { APIRoute } from "astro";
import { relationshipsReport } from "../../../../data/tiktok-relationships-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(relationshipsReport, "relationships"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
