import type { APIRoute } from "astro";
import { parentingReport } from "../../../../data/tiktok-parenting-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(parentingReport, "parenting"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
