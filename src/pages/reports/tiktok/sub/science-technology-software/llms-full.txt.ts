import type { APIRoute } from "astro";
import { scienceTechnologySoftwareSubReport } from "../../../../../data/tiktok-sub-science-technology-software-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceTechnologySoftwareSubReport, "science-technology-software"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
