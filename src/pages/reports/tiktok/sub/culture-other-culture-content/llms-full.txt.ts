import type { APIRoute } from "astro";
import { cultureOtherCultureContentSubReport } from "../../../../../data/tiktok-sub-culture-other-culture-content-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(cultureOtherCultureContentSubReport, "culture-other-culture-content"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
