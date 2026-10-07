import type { APIRoute } from "astro";
import { mediaAccountsReport } from "../../../../data/tiktok-media-accounts-report";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokLlmsFull(mediaAccountsReport, "media-accounts"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
