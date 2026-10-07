import type { APIRoute } from "astro";
import { healthcarePanHealthSubReport } from "../../../../../data/tiktok-sub-healthcare-pan-health-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(healthcarePanHealthSubReport, "healthcare-pan-health"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
