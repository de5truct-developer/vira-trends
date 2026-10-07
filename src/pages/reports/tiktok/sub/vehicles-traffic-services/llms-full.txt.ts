import type { APIRoute } from "astro";
import { vehiclesTrafficServicesSubReport } from "../../../../../data/tiktok-sub-vehicles-traffic-services-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(vehiclesTrafficServicesSubReport, "vehicles-traffic-services"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
