import type { APIRoute } from "astro";
import { vehiclesTransportEquipmentSubReport } from "../../../../../data/tiktok-sub-vehicles-transport-equipment-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(vehiclesTransportEquipmentSubReport, "vehicles-transport-equipment"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
