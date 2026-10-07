import type { APIRoute } from "astro";
import { hobbiesToysSubReport } from "../../../../../data/tiktok-sub-hobbies-toys-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesToysSubReport, "hobbies-toys"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
