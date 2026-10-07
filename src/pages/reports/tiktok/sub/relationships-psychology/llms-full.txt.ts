import type { APIRoute } from "astro";
import { relationshipsPsychologySubReport } from "../../../../../data/tiktok-sub-relationships-psychology-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(relationshipsPsychologySubReport, "relationships-psychology"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
