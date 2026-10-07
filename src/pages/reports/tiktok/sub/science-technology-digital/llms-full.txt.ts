import type { APIRoute } from "astro";
import { scienceTechnologyDigitalSubReport } from "../../../../../data/tiktok-sub-science-technology-digital-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceTechnologyDigitalSubReport, "science-technology-digital"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
