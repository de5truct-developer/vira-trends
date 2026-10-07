import type { APIRoute } from "astro";
import { householdHouseDecorationSubReport } from "../../../../../data/tiktok-sub-household-house-decoration-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(householdHouseDecorationSubReport, "household-house-decoration"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
