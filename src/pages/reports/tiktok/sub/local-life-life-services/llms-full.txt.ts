import type { APIRoute } from "astro";
import { localLifeLifeServicesSubReport } from "../../../../../data/tiktok-sub-local-life-life-services-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(localLifeLifeServicesSubReport, "local-life-life-services"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
