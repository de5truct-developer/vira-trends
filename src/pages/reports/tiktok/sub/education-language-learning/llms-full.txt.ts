import type { APIRoute } from "astro";
import { educationLanguageLearningSubReport } from "../../../../../data/tiktok-sub-education-language-learning-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationLanguageLearningSubReport, "education-language-learning"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
