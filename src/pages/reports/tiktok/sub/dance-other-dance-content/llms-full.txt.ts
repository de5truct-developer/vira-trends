import type { APIRoute } from "astro";
import { danceOtherDanceContentSubReport } from "../../../../../data/tiktok-sub-dance-other-dance-content-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(danceOtherDanceContentSubReport, "dance-other-dance-content"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
