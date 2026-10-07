import type { APIRoute } from "astro";
import { cultureTraditionsAndCultureSubReport } from "../../../../../data/tiktok-sub-culture-traditions-and-culture-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(cultureTraditionsAndCultureSubReport, "culture-traditions-and-culture"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
