import type { APIRoute } from "astro";
import { youtubeElectronicMusicSubReport } from "../../../../../data/youtube-sub-electronic-music-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeElectronicMusicSubReport, "electronic-music"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
