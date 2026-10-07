import type { APIRoute } from "astro";
import { tourismTourismRelatedPoliciesSubReport } from "../../../../../data/tiktok-sub-tourism-tourism-related-policies-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(tourismTourismRelatedPoliciesSubReport, "tourism-tourism-related-policies"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
