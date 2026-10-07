import type { APIRoute } from "astro";
import { scienceFactsUnresolvedMysteriesSubReport } from "../../../../../data/tiktok-sub-science-facts-unresolved-mysteries-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceFactsUnresolvedMysteriesSubReport, "science-facts-unresolved-mysteries"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
