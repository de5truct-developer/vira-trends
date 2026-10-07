import type { APIRoute } from "astro";
import { featuredContentTrendsChallengesSubReport } from "../../../../../data/tiktok-sub-featured-content-trends-challenges-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(featuredContentTrendsChallengesSubReport, "featured-content-trends-challenges"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
