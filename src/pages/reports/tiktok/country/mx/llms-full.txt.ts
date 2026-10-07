import type { APIRoute } from "astro";
import { mxCountryReport } from "../../../../../data/tiktok-country-mx-report";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokCountryLlmsFull(mxCountryReport, "mx"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
