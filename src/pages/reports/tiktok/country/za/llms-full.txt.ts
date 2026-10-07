import type { APIRoute } from "astro";
import { zaCountryReport } from "../../../../../data/tiktok-country-za-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(zaCountryReport, "za"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
