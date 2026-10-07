import type { APIRoute } from "astro";
import { localLifeGalleriesAndExhibitionsSubReport } from "../../../../../data/tiktok-sub-local-life-galleries-and-exhibitions-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(localLifeGalleriesAndExhibitionsSubReport, "local-life-galleries-and-exhibitions"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
