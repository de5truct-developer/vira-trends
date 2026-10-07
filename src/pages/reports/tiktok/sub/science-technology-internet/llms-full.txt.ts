import type { APIRoute } from "astro";
import { scienceTechnologyInternetSubReport } from "../../../../../data/tiktok-sub-science-technology-internet-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(scienceTechnologyInternetSubReport, "science-technology-internet"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
