import type { APIRoute } from "astro";
import { youtubeMmaReport } from "../../../../data/youtube-mma-report";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderYouTubeLlmsFull(youtubeMmaReport, "mma"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
