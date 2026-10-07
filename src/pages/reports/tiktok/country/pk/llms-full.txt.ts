import type { APIRoute } from "astro";
import { pkCountryReport } from "../../../../../data/tiktok-country-pk-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(pkCountryReport, "pk"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
