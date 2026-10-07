import type { APIRoute } from "astro";
import { danceLiveDancePerformanceSubReport } from "../../../../../data/tiktok-sub-dance-live-dance-performance-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(danceLiveDancePerformanceSubReport, "dance-live-dance-performance"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
