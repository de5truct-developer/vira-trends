import type { TikTokCountryReport } from "../data/tiktok-country-report-types";

// Shared body for every /reports/tiktok/country/<slug>/llms-full.txt route (GG-724 geography
// expansion), so the per-country routes don't each re-implement the same formatting.
export function renderTikTokCountryLlmsFull(report: TikTokCountryReport, slug: string): string {
  const { topics, country, countryCode, computedAt, windowStart, windowEnd, updatedAt, methodologyNote } =
    report;

  const lines = topics.map((t, i) => {
    const videos = t.videoNum === null ? "not reported" : String(t.videoNum);
    return (
      `${i + 1}. topic: ${t.topic}\n` +
      `   category: ${t.category} / ${t.subcategory}\n` +
      `   growth: ${t.growthMultiplier}x (trust: ${t.trust})\n` +
      `   videos_reported: ${videos}\n`
    );
  });

  return `# Vira Trend Reports — llms-full.txt
# Full per-topic facts backing https://trends.tryvira.app/reports/tiktok/country/${slug}
# One source of truth: numbers here match the visible page and the JSON-LD Dataset on that page.
# See /llms.txt for the full index of TikTok and YouTube reports.

report: TikTok trends in ${country}
region: ${countryCode}
growth_window: ${windowStart} to ${windowEnd}
data_as_of: ${computedAt}
page_updated: ${updatedAt}
methodology: https://trends.tryvira.app/reports/methodology
methodology_note: ${methodologyNote}

## Topics (ranked by growth, highest first, all categories)

${lines.join("\n")}
`;
}
