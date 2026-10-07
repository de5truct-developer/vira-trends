import type { APIRoute } from "astro";
import { workplaceWorkingPoliciesSubReport } from "../../../../../data/tiktok-sub-workplace-working-policies-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(workplaceWorkingPoliciesSubReport, "workplace-working-policies"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
