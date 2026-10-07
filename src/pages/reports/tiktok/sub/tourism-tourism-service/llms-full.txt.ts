import type { APIRoute } from "astro";
import { tourismTourismServiceSubReport } from "../../../../../data/tiktok-sub-tourism-tourism-service-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(tourismTourismServiceSubReport, "tourism-tourism-service"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
