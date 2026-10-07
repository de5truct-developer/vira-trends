import type { APIRoute } from "astro";
import { danceOtherDanceStyleSubReport } from "../../../../../data/tiktok-sub-dance-other-dance-style-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(danceOtherDanceStyleSubReport, "dance-other-dance-style"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
