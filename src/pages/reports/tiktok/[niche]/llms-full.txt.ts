import type { APIRoute } from "astro";
import { NICHES, loadNicheReport, type NicheManifestEntry } from "../../../../lib/tiktok-data";
import { renderTikTokLlmsFull } from "../../../../lib/tiktok-llms-full";

export const prerender = true;

export function getStaticPaths() {
  return NICHES.map((niche) => ({ params: { niche: niche.slug }, props: { niche } }));
}

export const GET: APIRoute = ({ props }) => {
  const niche = props.niche as NicheManifestEntry;
  const report = loadNicheReport(niche);
  return new Response(renderTikTokLlmsFull(report, niche.slug), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
