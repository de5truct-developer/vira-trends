import type { APIRoute } from "astro";
import { sportsSportsOthersSubReport } from "../../../../../data/tiktok-sub-sports-sports-others-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(sportsSportsOthersSubReport, "sports-sports-others"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
