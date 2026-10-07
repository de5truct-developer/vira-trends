import type { APIRoute } from "astro";
import { cultureReligionSubReport } from "../../../../../data/tiktok-sub-culture-religion-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(cultureReligionSubReport, "culture-religion"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
