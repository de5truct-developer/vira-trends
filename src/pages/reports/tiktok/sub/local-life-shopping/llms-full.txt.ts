import type { APIRoute } from "astro";
import { localLifeShoppingSubReport } from "../../../../../data/tiktok-sub-local-life-shopping-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(localLifeShoppingSubReport, "local-life-shopping"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
