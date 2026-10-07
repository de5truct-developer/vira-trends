import type { APIRoute } from "astro";
import { featuredContentInternetSubReport } from "../../../../../data/tiktok-sub-featured-content-internet-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(featuredContentInternetSubReport, "featured-content-internet"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
