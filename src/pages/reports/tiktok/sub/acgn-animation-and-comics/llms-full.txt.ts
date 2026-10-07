import type { APIRoute } from "astro";
import { acgnAnimationAndComicsSubReport } from "../../../../../data/tiktok-sub-acgn-animation-and-comics-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(acgnAnimationAndComicsSubReport, "acgn-animation-and-comics"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
