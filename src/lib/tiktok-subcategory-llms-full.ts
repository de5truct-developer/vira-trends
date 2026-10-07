import type { TikTokSubcategoryReport } from "../data/tiktok-subcategory-report-types";

// Shared body for every /reports/tiktok/sub/<slug>/llms-full.txt route (GG-724 subcategory
// expansion), so the per-subcategory routes don't each re-implement the same formatting.
export function renderTikTokSubcategoryLlmsFull(report: TikTokSubcategoryReport, slug: string): string {
  const { topics, subcategory, parentCategory, parentSlug, region, computedAt, windowStart, windowEnd, updatedAt, methodologyNote } =
    report;

  const lines = topics.map((t, i) => {
    const videos = t.videoNum === null ? "not reported" : String(t.videoNum);
    return (
      `${i + 1}. topic: ${t.topic}\n` +
      `   growth: ${t.growthMultiplier}x (trust: ${t.trust})\n` +
      `   videos_reported: ${videos}\n` +
      `   top_countries: ${t.topCountries.join(", ")}\n`
    );
  });

  return `# Vira Trend Reports — llms-full.txt
# Full per-topic facts backing https://trends.tryvira.app/reports/tiktok/sub/${slug}
# One source of truth: numbers here match the visible page and the JSON-LD Dataset on that page.
# See /llms.txt for the full index of TikTok and YouTube reports.

report: TikTok ${subcategory} trends (part of ${parentCategory})
parent_category: ${parentCategory} (https://trends.tryvira.app/reports/tiktok/${parentSlug})
region: ${region}
growth_window: ${windowStart} to ${windowEnd}
data_as_of: ${computedAt}
page_updated: ${updatedAt}
methodology: https://trends.tryvira.app/reports/methodology
methodology_note: ${methodologyNote}

## Topics (ranked by growth, highest first)

${lines.join("\n")}
`;
}
