import type { APIRoute } from "astro";
import { gourmetOtherGourmetSubReport } from "../../../../../data/tiktok-sub-gourmet-other-gourmet-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(gourmetOtherGourmetSubReport, "gourmet-other-gourmet"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
