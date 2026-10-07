import type { APIRoute } from "astro";
import { tourismTouristGuideSubReport } from "../../../../../data/tiktok-sub-tourism-tourist-guide-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(tourismTouristGuideSubReport, "tourism-tourist-guide"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
