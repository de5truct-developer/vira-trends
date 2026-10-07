import type { APIRoute } from "astro";
import { tourismTourismSitesSubReport } from "../../../../../data/tiktok-sub-tourism-tourism-sites-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(tourismTourismSitesSubReport, "tourism-tourism-sites"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
