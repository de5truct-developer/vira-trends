import type { APIRoute } from "astro";
import { hobbiesReport } from "../../../../data/tiktok-hobbies-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(hobbiesReport, "hobbies"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
