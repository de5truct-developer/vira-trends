import type { APIRoute } from "astro";
import { scienceTechnologyWebRecourcesDownloadSubReport } from "../../../../../data/tiktok-sub-science-technology-web-recources-download-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceTechnologyWebRecourcesDownloadSubReport, "science-technology-web-recources-download"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
