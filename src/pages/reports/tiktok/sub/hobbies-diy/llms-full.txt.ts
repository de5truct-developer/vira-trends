import type { APIRoute } from "astro";
import { hobbiesDiySubReport } from "../../../../../data/tiktok-sub-hobbies-diy-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesDiySubReport, "hobbies-diy"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
