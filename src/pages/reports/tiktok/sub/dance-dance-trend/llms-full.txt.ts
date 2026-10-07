import type { APIRoute } from "astro";
import { danceDanceTrendSubReport } from "../../../../../data/tiktok-sub-dance-dance-trend-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(danceDanceTrendSubReport, "dance-dance-trend"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
