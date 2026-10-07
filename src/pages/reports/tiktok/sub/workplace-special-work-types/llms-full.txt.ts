import type { APIRoute } from "astro";
import { workplaceSpecialWorkTypesSubReport } from "../../../../../data/tiktok-sub-workplace-special-work-types-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(workplaceSpecialWorkTypesSubReport, "workplace-special-work-types"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
