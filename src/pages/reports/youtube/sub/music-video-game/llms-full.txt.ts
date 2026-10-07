import type { APIRoute } from "astro";
import { youtubeMusicVideoGameSubReport } from "../../../../../data/youtube-sub-music-video-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeMusicVideoGameSubReport, "music-video-game"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
