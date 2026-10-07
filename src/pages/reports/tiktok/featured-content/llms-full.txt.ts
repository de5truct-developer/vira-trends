import type { APIRoute } from "astro";
import { featuredContentReport } from "../../../../data/tiktok-featured-content-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(featuredContentReport, "featured-content"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
