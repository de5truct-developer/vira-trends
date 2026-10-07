import type { APIRoute } from "astro";
import { gourmetFoodTutorialsSubReport } from "../../../../../data/tiktok-sub-gourmet-food-tutorials-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetFoodTutorialsSubReport, "gourmet-food-tutorials"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
