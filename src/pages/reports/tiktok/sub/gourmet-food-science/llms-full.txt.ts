import type { APIRoute } from "astro";
import { gourmetFoodScienceSubReport } from "../../../../../data/tiktok-sub-gourmet-food-science-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetFoodScienceSubReport, "gourmet-food-science"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
