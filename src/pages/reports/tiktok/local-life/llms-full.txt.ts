import type { APIRoute } from "astro";
import { localLifeReport } from "../../../../data/tiktok-local-life-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(localLifeReport, "local-life"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
