import type { APIRoute } from "astro";
import { educationVocationalLicenseExamsSubReport } from "../../../../../data/tiktok-sub-education-vocational-license-exams-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationVocationalLicenseExamsSubReport, "education-vocational-license-exams"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
