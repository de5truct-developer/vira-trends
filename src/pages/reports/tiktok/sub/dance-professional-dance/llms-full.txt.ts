import type { APIRoute } from "astro";
import { danceProfessionalDanceSubReport } from "../../../../../data/tiktok-sub-dance-professional-dance-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(danceProfessionalDanceSubReport, "dance-professional-dance"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
