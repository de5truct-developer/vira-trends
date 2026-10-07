import type { APIRoute } from "astro";
import { mmCountryReport } from "../../../../../data/tiktok-country-mm-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(mmCountryReport, "mm"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
