import type { APIRoute } from "astro";
import { SUBCATEGORIES, loadSubcategoryReport, type SubcategoryManifestEntry } from "../../../../../lib/tiktok-data";
import { renderTikTokSubcategoryLlmsFull } from "../../../../../lib/tiktok-subcategory-llms-full";

export const prerender = true;

export function getStaticPaths() {
  return SUBCATEGORIES.map((subcategory) => ({ params: { slug: subcategory.slug }, props: { subcategory } }));
}

export const GET: APIRoute = ({ props }) => {
  const subcategory = props.subcategory as SubcategoryManifestEntry;
  const report = loadSubcategoryReport(subcategory);
  return new Response(renderTikTokSubcategoryLlmsFull(report, subcategory.slug), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
