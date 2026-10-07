import type { APIRoute } from "astro";
import { NICHES, loadNicheReport, type NicheManifestEntry } from "../../../../lib/youtube-data";
import { renderYouTubeLlmsFull } from "../../../../lib/youtube-llms-full";

export const prerender = true;

export function getStaticPaths() {
  return NICHES.map((niche) => ({ params: { niche: niche.slug }, props: { niche } }));
}

export const GET: APIRoute = ({ props }) => {
  const niche = props.niche as NicheManifestEntry;
  const report = loadNicheReport(niche);
  return new Response(renderYouTubeLlmsFull(report, niche.slug), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
