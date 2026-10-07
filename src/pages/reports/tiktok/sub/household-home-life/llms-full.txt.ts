import type { APIRoute } from "astro";
import { householdHomeLifeSubReport } from "../../../../../data/tiktok-sub-household-home-life-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(householdHomeLifeSubReport, "household-home-life"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
