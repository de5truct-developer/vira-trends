import type { APIRoute } from "astro";
import { workplaceOtherWorkplaceSubReport } from "../../../../../data/tiktok-sub-workplace-other-workplace-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(workplaceOtherWorkplaceSubReport, "workplace-other-workplace"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
