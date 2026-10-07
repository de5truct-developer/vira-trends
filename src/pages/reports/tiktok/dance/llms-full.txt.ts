import type { APIRoute } from "astro";
import { danceReport } from "../../../../data/tiktok-dance-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(danceReport, "dance"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
