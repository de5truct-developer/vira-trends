import type { APIRoute } from "astro";
import { localLifeOfflinePerformanceSubReport } from "../../../../../data/tiktok-sub-local-life-offline-performance-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(localLifeOfflinePerformanceSubReport, "local-life-offline-performance"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
