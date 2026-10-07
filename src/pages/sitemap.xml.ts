import type { APIRoute } from "astro";
import { NICHES, COUNTRIES, SUBCATEGORIES } from "../lib/tiktok-data";
import { NICHES as YOUTUBE_NICHES, SUBGENRES as YOUTUBE_SUBGENRES } from "../lib/youtube-data";

export const prerender = true;

function urlEntry(loc: string, lastmod: string): string {
  return `  <url>\n    <loc>https://trends.tryvira.app${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    urlEntry("/", today),
    ...NICHES.map((n) => urlEntry(`/reports/tiktok/${n.slug}`, today)),
    ...COUNTRIES.map((c) => urlEntry(`/reports/tiktok/country/${c.slug}`, today)),
    ...SUBCATEGORIES.map((s) => urlEntry(`/reports/tiktok/sub/${s.slug}`, today)),
    ...YOUTUBE_NICHES.map((n) => urlEntry(`/reports/youtube/${n.slug}`, today)),
    ...YOUTUBE_SUBGENRES.map((s) => urlEntry(`/reports/youtube/sub/${s.slug}`, today)),
    urlEntry("/reports/methodology", today),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls.join("\n")}\n` +
    `</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
