import type { APIRoute } from "astro";
import { hobbiesPerformanceInterestsOperaArtSubReport } from "../../../../../data/tiktok-sub-hobbies-performance-interests-opera-art-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesPerformanceInterestsOperaArtSubReport, "hobbies-performance-interests-opera-art"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
