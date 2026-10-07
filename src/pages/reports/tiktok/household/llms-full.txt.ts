import type { APIRoute } from "astro";
import { householdReport } from "../../../../data/tiktok-household-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(householdReport, "household"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
