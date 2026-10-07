import type { APIRoute } from "astro";
import { NICHES, COUNTRIES, SUBCATEGORIES } from "../lib/tiktok-data";

export const prerender = true;

// YouTube side intentionally untouched (GG-724 auto-discovery scope is TikTok only) -- same slug
// list the old static public/sitemap.xml had, just moved here so TikTok's half of this file can
// be generated from the manifests instead of needing a hand-edit every time a niche/country/
// subcategory is added or removed.
const YOUTUBE_SLUGS = [
  "food", "lifestyle", "gaming", "music", "entertainment", "film", "technology", "health",
  "tourism", "fashion", "society", "knowledge", "hobby", "vehicles", "religion", "politics",
  "sports", "pets", "business", "military", "humor", "performing-arts", "tv", "fitness",
  "beauty", "soccer", "basketball", "cricket", "baseball", "american-football", "ice-hockey",
  "tennis", "volleyball", "golf", "boxing", "mma",
];

const YOUTUBE_SUBGENRE_SLUGS = [
  "music-of-asia", "electronic-music", "hip-hop-music", "music-of-latin-america", "pop-music",
  "rock-music", "classical-music", "jazz", "christian-music", "country-music", "reggae",
  "soul-music", "independent-music", "action-game", "role-playing-video-game", "sports-game",
  "simulation-video-game", "puzzle-video-game", "racing-video-game", "music-video-game",
  "action-adventure-game", "strategy-video-game", "casual-game",
];

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
    ...YOUTUBE_SLUGS.map((slug) => urlEntry(`/reports/youtube/${slug}`, today)),
    ...YOUTUBE_SUBGENRE_SLUGS.map((slug) => urlEntry(`/reports/youtube/sub/${slug}`, today)),
    urlEntry("/reports/methodology", today),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls.join("\n")}\n` +
    `</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
