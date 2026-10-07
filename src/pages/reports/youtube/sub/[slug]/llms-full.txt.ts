import type { APIRoute } from "astro";
import { SUBGENRES, loadSubgenreReport, type SubgenreManifestEntry } from "../../../../../lib/youtube-data";
import { renderYouTubeSubgenreLlmsFull } from "../../../../../lib/youtube-subgenre-llms-full";

export const prerender = true;

export function getStaticPaths() {
  return SUBGENRES.map((subgenre) => ({ params: { slug: subgenre.slug }, props: { subgenre } }));
}

export const GET: APIRoute = ({ props }) => {
  const subgenre = props.subgenre as SubgenreManifestEntry;
  const report = loadSubgenreReport(subgenre);
  return new Response(renderYouTubeSubgenreLlmsFull(report, subgenre.slug), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
