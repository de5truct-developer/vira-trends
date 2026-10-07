import type { APIRoute } from "astro";
import { workplaceWorkplaceSkillsSubReport } from "../../../../../data/tiktok-sub-workplace-workplace-skills-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(workplaceWorkplaceSkillsSubReport, "workplace-workplace-skills"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
