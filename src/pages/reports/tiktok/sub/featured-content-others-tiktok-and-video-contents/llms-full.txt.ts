import type { APIRoute } from "astro";
import { featuredContentOthersTiktokAndVideoContentsSubReport } from "../../../../../data/tiktok-sub-featured-content-others-tiktok-and-video-contents-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(featuredContentOthersTiktokAndVideoContentsSubReport, "featured-content-others-tiktok-and-video-contents"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
