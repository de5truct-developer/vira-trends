import type { APIRoute } from "astro";
import { caCountryReport } from "../../../../../data/tiktok-country-ca-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(caCountryReport, "ca"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
