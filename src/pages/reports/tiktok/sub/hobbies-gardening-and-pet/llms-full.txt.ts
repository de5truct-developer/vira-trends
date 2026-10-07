import type { APIRoute } from "astro";
import { hobbiesGardeningAndPetSubReport } from "../../../../../data/tiktok-sub-hobbies-gardening-and-pet-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesGardeningAndPetSubReport, "hobbies-gardening-and-pet"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
