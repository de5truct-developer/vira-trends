import type { APIRoute } from "astro";
import { featuredContentStoriesPostingCaptionsSubReport } from "../../../../../data/tiktok-sub-featured-content-stories-posting-captions-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(featuredContentStoriesPostingCaptionsSubReport, "featured-content-stories-posting-captions"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
