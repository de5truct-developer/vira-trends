import type { APIRoute } from "astro";
import { gourmetFoodFestivalsActivitiesSubReport } from "../../../../../data/tiktok-sub-gourmet-food-festivals-activities-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetFoodFestivalsActivitiesSubReport, "gourmet-food-festivals-activities"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
