// Shared types for TikTok subcategory trend reports (GG-724 subcategory expansion). Hand-written,
// not regenerated — scripts/generate-reports.py imports these instead of redefining the
// interface in every per-subcategory data file.
//
// Distinct from TikTokReport (tiktok-report-types.ts): a subcategory report fixes both cat_l1
// and cat_l2 (e.g. Gourmet / Food Tutorials), so the page-level category is the subcategory
// itself and topics don't carry their own subcategory field (it would just repeat the page title).

export interface TopicFactSubcategory {
  topic: string;
  growthMultiplier: number;
  trust: "high" | "med" | "low" | "none";
  videoNum: number | null; // null = not reported by TikTok (video_num=0)
  topCountries: string[];
}

export interface TikTokSubcategoryReport {
  subcategory: string; // display name, e.g. "Food Tutorials"
  parentCategory: string; // display name of the niche, e.g. "Gourmet"
  parentSlug: string; // niche slug, for linking back to /reports/tiktok/<parentSlug>
  region: string;
  computedAt: string; // ISO, UTC
  windowEnd: string; // date, growth window end
  windowStart: string; // date, growth window start (21d)
  updatedAt: string; // date, page "last updated"
  topics: TopicFactSubcategory[];
  methodologyNote: string;
  highlightTopic: {
    topic: string;
    audience: string; // dominant audience segment
  };
}
