import type { APIRoute } from "astro";
import { gourmetOfflineCateringSubReport } from "../../../../../data/tiktok-sub-gourmet-offline-catering-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetOfflineCateringSubReport, "gourmet-offline-catering"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
