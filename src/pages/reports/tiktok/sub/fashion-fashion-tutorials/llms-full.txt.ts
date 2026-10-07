import type { APIRoute } from "astro";
import { fashionFashionTutorialsSubReport } from "../../../../../data/tiktok-sub-fashion-fashion-tutorials-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(fashionFashionTutorialsSubReport, "fashion-fashion-tutorials"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
