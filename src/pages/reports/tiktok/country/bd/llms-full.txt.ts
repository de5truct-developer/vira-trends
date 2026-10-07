import type { APIRoute } from "astro";
import { bdCountryReport } from "../../../../../data/tiktok-country-bd-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(bdCountryReport, "bd"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
