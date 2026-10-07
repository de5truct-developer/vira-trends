import type { APIRoute } from "astro";
import { vehiclesTrafficPlaceNamesSubReport } from "../../../../../data/tiktok-sub-vehicles-traffic-place-names-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(vehiclesTrafficPlaceNamesSubReport, "vehicles-traffic-place-names"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
