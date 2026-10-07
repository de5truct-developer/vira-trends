import type { APIRoute } from "astro";
import { hobbiesArtRelatedInterestsSubReport } from "../../../../../data/tiktok-sub-hobbies-art-related-interests-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesArtRelatedInterestsSubReport, "hobbies-art-related-interests"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
