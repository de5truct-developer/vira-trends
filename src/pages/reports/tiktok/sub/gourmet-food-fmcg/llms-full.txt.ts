import type { APIRoute } from "astro";
import { gourmetFoodFmcgSubReport } from "../../../../../data/tiktok-sub-gourmet-food-fmcg-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetFoodFmcgSubReport, "gourmet-food-fmcg"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
