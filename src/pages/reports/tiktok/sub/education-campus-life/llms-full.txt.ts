import type { APIRoute } from "astro";
import { educationCampusLifeSubReport } from "../../../../../data/tiktok-sub-education-campus-life-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(educationCampusLifeSubReport, "education-campus-life"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
