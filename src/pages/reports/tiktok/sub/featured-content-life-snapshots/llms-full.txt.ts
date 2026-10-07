import type { APIRoute } from "astro";
import { featuredContentLifeSnapshotsSubReport } from "../../../../../data/tiktok-sub-featured-content-life-snapshots-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(featuredContentLifeSnapshotsSubReport, "featured-content-life-snapshots"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
