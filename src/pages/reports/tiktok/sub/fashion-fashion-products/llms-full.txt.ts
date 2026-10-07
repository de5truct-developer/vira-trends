import type { APIRoute } from "astro";
import { fashionFashionProductsSubReport } from "../../../../../data/tiktok-sub-fashion-fashion-products-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(fashionFashionProductsSubReport, "fashion-fashion-products"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
