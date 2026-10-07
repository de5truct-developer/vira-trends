import type { APIRoute } from "astro";
import { auCountryReport } from "../../../../../data/tiktok-country-au-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(auCountryReport, "au"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
