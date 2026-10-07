import type { APIRoute } from "astro";
import { musicReport } from "../../../../data/tiktok-music-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(musicReport, "music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
