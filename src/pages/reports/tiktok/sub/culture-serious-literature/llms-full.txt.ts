import type { APIRoute } from "astro";
import { cultureSeriousLiteratureSubReport } from "../../../../../data/tiktok-sub-culture-serious-literature-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(cultureSeriousLiteratureSubReport, "culture-serious-literature"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
