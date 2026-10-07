import type { APIRoute } from "astro";
import { danceDanceTutorialSubReport } from "../../../../../data/tiktok-sub-dance-dance-tutorial-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(danceDanceTutorialSubReport, "dance-dance-tutorial"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
