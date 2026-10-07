import type { APIRoute } from "astro";
import { educationEducationOthersSubReport } from "../../../../../data/tiktok-sub-education-education-others-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationEducationOthersSubReport, "education-education-others"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
