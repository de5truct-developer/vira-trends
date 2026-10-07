import type { APIRoute } from "astro";
import { hobbiesVisualRelatedInterestsSubReport } from "../../../../../data/tiktok-sub-hobbies-visual-related-interests-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesVisualRelatedInterestsSubReport, "hobbies-visual-related-interests"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
