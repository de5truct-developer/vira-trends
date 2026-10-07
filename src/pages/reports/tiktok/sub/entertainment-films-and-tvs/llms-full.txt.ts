import type { APIRoute } from "astro";
import { entertainmentFilmsAndTvsSubReport } from "../../../../../data/tiktok-sub-entertainment-films-and-tvs-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(entertainmentFilmsAndTvsSubReport, "entertainment-films-and-tvs"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
