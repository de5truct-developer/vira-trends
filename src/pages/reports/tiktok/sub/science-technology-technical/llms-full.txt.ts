import type { APIRoute } from "astro";
import { scienceTechnologyTechnicalSubReport } from "../../../../../data/tiktok-sub-science-technology-technical-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceTechnologyTechnicalSubReport, "science-technology-technical"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
