import type { APIRoute } from "astro";
import { educationEducationSuppliesSubReport } from "../../../../../data/tiktok-sub-education-education-supplies-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationEducationSuppliesSubReport, "education-education-supplies"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
