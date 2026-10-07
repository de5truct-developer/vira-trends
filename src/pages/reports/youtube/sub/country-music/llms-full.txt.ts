import type { APIRoute } from "astro";
import { youtubeCountryMusicSubReport } from "../../../../../data/youtube-sub-country-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeCountryMusicSubReport, "country-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
