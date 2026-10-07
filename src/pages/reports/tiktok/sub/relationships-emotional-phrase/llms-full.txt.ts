import type { APIRoute } from "astro";
import { relationshipsEmotionalPhraseSubReport } from "../../../../../data/tiktok-sub-relationships-emotional-phrase-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(relationshipsEmotionalPhraseSubReport, "relationships-emotional-phrase"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
