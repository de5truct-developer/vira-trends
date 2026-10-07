import type { APIRoute } from "astro";
import { gbCountryReport } from "../../../../../data/tiktok-country-gb-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(gbCountryReport, "gb"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
