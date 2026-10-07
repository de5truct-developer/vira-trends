import type { APIRoute } from "astro";
import { brCountryReport } from "../../../../../data/tiktok-country-br-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(brCountryReport, "br"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
