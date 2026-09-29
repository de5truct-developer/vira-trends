import type { APIRoute } from "astro";
import { gourmetReport } from "../data/gourmet-report";

export const prerender = true;

export const GET: APIRoute = () => {
  const { topics, region, computedAt, windowStart, windowEnd, updatedAt, methodologyNote } =
    gourmetReport;

  const lines = topics.map((t, i) => {
    const videos = t.videoNum === null ? "not reported" : String(t.videoNum);
    return (
      `${i + 1}. topic: ${t.topic}\n` +
      `   category: Gourmet / ${t.subcategory}\n` +
      `   growth: ${t.growthMultiplier}x (trust: ${t.trust})\n` +
      `   videos_reported: ${videos}\n` +
      `   top_countries: ${t.topCountries.join(", ")}\n`
    );
  });

  const body = `# Vira Trend Reports — llms-full.txt
# Full per-topic facts backing https://trends.tryvira.app/reports/tiktok/gourmet
# One source of truth: numbers here match the visible page and the JSON-LD Dataset on that page.

report: TikTok Gourmet trends
region: ${region}
growth_window: ${windowStart} to ${windowEnd}
data_as_of: ${computedAt}
page_updated: ${updatedAt}
methodology: https://trends.tryvira.app/reports/methodology
methodology_note: ${methodologyNote}

## Topics (ranked by growth, highest first)

${lines.join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
