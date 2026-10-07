import type { APIRoute } from "astro";
import { localLifeLeisureAndEntertainmentSubReport } from "../../../../../data/tiktok-sub-local-life-leisure-and-entertainment-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(localLifeLeisureAndEntertainmentSubReport, "local-life-leisure-and-entertainment"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
