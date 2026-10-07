import type { APIRoute } from "astro";
import { tourismAdministrativeDivisionSubReport } from "../../../../../data/tiktok-sub-tourism-administrative-division-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(tourismAdministrativeDivisionSubReport, "tourism-administrative-division"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
