import type { APIRoute } from "astro";
import { youtubeJazzSubReport } from "../../../../../data/youtube-sub-jazz-report";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeSubgenreLlmsFull(youtubeJazzSubReport, "jazz"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
