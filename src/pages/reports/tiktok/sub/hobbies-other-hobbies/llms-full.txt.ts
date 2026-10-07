import type { APIRoute } from "astro";
import { hobbiesOtherHobbiesSubReport } from "../../../../../data/tiktok-sub-hobbies-other-hobbies-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesOtherHobbiesSubReport, "hobbies-other-hobbies"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
