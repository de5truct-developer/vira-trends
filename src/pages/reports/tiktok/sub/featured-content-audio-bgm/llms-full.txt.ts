import type { APIRoute } from "astro";
import { featuredContentAudioBgmSubReport } from "../../../../../data/tiktok-sub-featured-content-audio-bgm-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(featuredContentAudioBgmSubReport, "featured-content-audio-bgm"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
