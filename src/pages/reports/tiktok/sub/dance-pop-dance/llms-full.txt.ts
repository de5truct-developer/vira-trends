import type { APIRoute } from "astro";
import { dancePopDanceSubReport } from "../../../../../data/tiktok-sub-dance-pop-dance-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(dancePopDanceSubReport, "dance-pop-dance"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
