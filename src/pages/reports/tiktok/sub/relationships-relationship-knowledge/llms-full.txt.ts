import type { APIRoute } from "astro";
import { relationshipsRelationshipKnowledgeSubReport } from "../../../../../data/tiktok-sub-relationships-relationship-knowledge-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(relationshipsRelationshipKnowledgeSubReport, "relationships-relationship-knowledge"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
