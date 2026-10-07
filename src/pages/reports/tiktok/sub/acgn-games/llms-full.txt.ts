import type { APIRoute } from "astro";
import { acgnGamesSubReport } from "../../../../../data/tiktok-sub-acgn-games-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(acgnGamesSubReport, "acgn-games"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
