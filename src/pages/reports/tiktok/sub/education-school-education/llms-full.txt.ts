import type { APIRoute } from "astro";
import { educationSchoolEducationSubReport } from "../../../../../data/tiktok-sub-education-school-education-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationSchoolEducationSubReport, "education-school-education"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
