import type { APIRoute } from "astro";
import { workplaceWorkingIndustryMarketSubReport } from "../../../../../data/tiktok-sub-workplace-working-industry-market-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(workplaceWorkingIndustryMarketSubReport, "workplace-working-industry-market"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
