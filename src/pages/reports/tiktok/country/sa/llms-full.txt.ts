import type { APIRoute } from "astro";
import { saCountryReport } from "../../../../../data/tiktok-country-sa-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(saCountryReport, "sa"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
