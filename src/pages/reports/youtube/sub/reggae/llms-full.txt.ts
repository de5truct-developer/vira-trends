import type { APIRoute } from "astro";
import { youtubeReggaeSubReport } from "../../../../../data/youtube-sub-reggae-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeReggaeSubReport, "reggae"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
