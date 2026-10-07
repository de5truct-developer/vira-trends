import type { APIRoute } from "astro";
import { educationOnlineEducationSubReport } from "../../../../../data/tiktok-sub-education-online-education-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationOnlineEducationSubReport, "education-online-education"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
