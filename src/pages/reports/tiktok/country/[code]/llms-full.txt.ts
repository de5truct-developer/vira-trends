import type { APIRoute } from "astro";
import { COUNTRIES, loadCountryReport, type CountryManifestEntry } from "../../../../../lib/tiktok-data";
import { renderTikTokCountryLlmsFull } from "../../../../../lib/tiktok-country-llms-full";

export const prerender = true;

export function getStaticPaths() {
  return COUNTRIES.map((country) => ({ params: { code: country.slug }, props: { country } }));
}

export const GET: APIRoute = ({ props }) => {
  const country = props.country as CountryManifestEntry;
  const report = loadCountryReport(country);
  return new Response(renderTikTokCountryLlmsFull(report, country.slug), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
