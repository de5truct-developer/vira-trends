import type { APIRoute } from "astro";
import { localLifeSportsAndFitnessSubReport } from "../../../../../data/tiktok-sub-local-life-sports-and-fitness-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(localLifeSportsAndFitnessSubReport, "local-life-sports-and-fitness"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
