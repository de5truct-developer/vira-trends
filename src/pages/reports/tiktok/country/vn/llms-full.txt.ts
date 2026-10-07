import type { APIRoute } from "astro";
import { vnCountryReport } from "../../../../../data/tiktok-country-vn-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(vnCountryReport, "vn"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
