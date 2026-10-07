import type { APIRoute } from "astro";
import { ngCountryReport } from "../../../../../data/tiktok-country-ng-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(ngCountryReport, "ng"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
