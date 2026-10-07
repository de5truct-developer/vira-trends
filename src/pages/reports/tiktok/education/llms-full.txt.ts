import type { APIRoute } from "astro";
import { educationReport } from "../../../../data/tiktok-education-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(educationReport, "education"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
