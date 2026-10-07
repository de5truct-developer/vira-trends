import type { APIRoute } from "astro";
import { workplaceRecruitmentInformationSubReport } from "../../../../../data/tiktok-sub-workplace-recruitment-information-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(workplaceRecruitmentInformationSubReport, "workplace-recruitment-information"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
