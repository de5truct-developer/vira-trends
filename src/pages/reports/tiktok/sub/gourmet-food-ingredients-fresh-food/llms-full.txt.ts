import type { APIRoute } from "astro";
import { gourmetFoodIngredientsFreshFoodSubReport } from "../../../../../data/tiktok-sub-gourmet-food-ingredients-fresh-food-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetFoodIngredientsFreshFoodSubReport, "gourmet-food-ingredients-fresh-food"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
