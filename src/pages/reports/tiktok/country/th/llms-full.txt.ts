import type { APIRoute } from "astro";
import { thCountryReport } from "../../../../../data/tiktok-country-th-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(thCountryReport, "th"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
