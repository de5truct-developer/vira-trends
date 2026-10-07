import type { APIRoute } from "astro";
import { householdRealEstateSubReport } from "../../../../../data/tiktok-sub-household-real-estate-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(householdRealEstateSubReport, "household-real-estate"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
