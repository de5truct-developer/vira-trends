import type { APIRoute } from "astro";
import { tourismTouristSuppliesSubReport } from "../../../../../data/tiktok-sub-tourism-tourist-supplies-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(tourismTouristSuppliesSubReport, "tourism-tourist-supplies"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
