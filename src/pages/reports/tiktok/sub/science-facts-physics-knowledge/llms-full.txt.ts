import type { APIRoute } from "astro";
import { scienceFactsPhysicsKnowledgeSubReport } from "../../../../../data/tiktok-sub-science-facts-physics-knowledge-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceFactsPhysicsKnowledgeSubReport, "science-facts-physics-knowledge"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
