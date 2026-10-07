import type { APIRoute } from "astro";
import { scienceFactsAstronomyKnowledgeSubReport } from "../../../../../data/tiktok-sub-science-facts-astronomy-knowledge-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceFactsAstronomyKnowledgeSubReport, "science-facts-astronomy-knowledge"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
