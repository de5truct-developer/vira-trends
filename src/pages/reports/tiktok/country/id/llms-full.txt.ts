import type { APIRoute } from "astro";
import { idCountryReport } from "../../../../../data/tiktok-country-id-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(idCountryReport, "id"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
