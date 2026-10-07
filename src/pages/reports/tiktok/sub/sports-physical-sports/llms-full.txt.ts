import type { APIRoute } from "astro";
import { sportsPhysicalSportsSubReport } from "../../../../../data/tiktok-sub-sports-physical-sports-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(sportsPhysicalSportsSubReport, "sports-physical-sports"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
