import type { APIRoute } from "astro";
import { entertainmentCelebrityEntertainmentSubReport } from "../../../../../data/tiktok-sub-entertainment-celebrity-entertainment-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(entertainmentCelebrityEntertainmentSubReport, "entertainment-celebrity-entertainment"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
