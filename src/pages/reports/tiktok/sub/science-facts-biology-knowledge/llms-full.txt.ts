import type { APIRoute } from "astro";
import { scienceFactsBiologyKnowledgeSubReport } from "../../../../../data/tiktok-sub-science-facts-biology-knowledge-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceFactsBiologyKnowledgeSubReport, "science-facts-biology-knowledge"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
