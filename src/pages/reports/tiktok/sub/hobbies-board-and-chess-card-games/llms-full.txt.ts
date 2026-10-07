import type { APIRoute } from "astro";
import { hobbiesBoardAndChessCardGamesSubReport } from "../../../../../data/tiktok-sub-hobbies-board-and-chess-card-games-report";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderTikTokSubcategoryLlmsFull(hobbiesBoardAndChessCardGamesSubReport, "hobbies-board-and-chess-card-games"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
