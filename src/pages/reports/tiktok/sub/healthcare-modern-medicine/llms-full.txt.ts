import type { APIRoute } from "astro";
import { healthcareModernMedicineSubReport } from "../../../../../data/tiktok-sub-healthcare-modern-medicine-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(healthcareModernMedicineSubReport, "healthcare-modern-medicine"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
