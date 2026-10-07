import type { APIRoute } from "astro";
import { usCountryReport } from "../../../../../data/tiktok-country-us-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(usCountryReport, "us"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
