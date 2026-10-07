import type { APIRoute } from "astro";
import { egCountryReport } from "../../../../../data/tiktok-country-eg-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(egCountryReport, "eg"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
