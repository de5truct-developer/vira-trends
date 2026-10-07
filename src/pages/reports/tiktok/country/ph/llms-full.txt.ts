import type { APIRoute } from "astro";
import { phCountryReport } from "../../../../../data/tiktok-country-ph-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(phCountryReport, "ph"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
