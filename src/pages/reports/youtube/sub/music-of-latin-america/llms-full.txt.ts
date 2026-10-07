import type { APIRoute } from "astro";
import { youtubeMusicOfLatinAmericaSubReport } from "../../../../../data/youtube-sub-music-of-latin-america-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeMusicOfLatinAmericaSubReport, "music-of-latin-america"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
