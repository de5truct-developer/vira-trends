import type { APIRoute } from "astro";
import { fashionFashionNewsSubReport } from "../../../../../data/tiktok-sub-fashion-fashion-news-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(fashionFashionNewsSubReport, "fashion-fashion-news"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
