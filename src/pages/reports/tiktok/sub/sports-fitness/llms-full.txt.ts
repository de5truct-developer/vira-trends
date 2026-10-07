import type { APIRoute } from "astro";
import { sportsFitnessSubReport } from "../../../../../data/tiktok-sub-sports-fitness-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(sportsFitnessSubReport, "sports-fitness"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
