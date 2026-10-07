import type { APIRoute } from "astro";
import { scienceFactsScienceKnowledgeOthersSubReport } from "../../../../../data/tiktok-sub-science-facts-science-knowledge-others-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceFactsScienceKnowledgeOthersSubReport, "science-facts-science-knowledge-others"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
