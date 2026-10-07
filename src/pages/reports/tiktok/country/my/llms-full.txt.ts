import type { APIRoute } from "astro";
import { myCountryReport } from "../../../../../data/tiktok-country-my-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(myCountryReport, "my"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
