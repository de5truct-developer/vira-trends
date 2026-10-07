import type { APIRoute } from "astro";
import { scienceFactsGeologyKnowledgeSubReport } from "../../../../../data/tiktok-sub-science-facts-geology-knowledge-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceFactsGeologyKnowledgeSubReport, "science-facts-geology-knowledge"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
