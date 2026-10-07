// Shared types for TikTok country trend reports (GG-724 geography expansion). Hand-written,
// not regenerated — scripts/generate-reports.py imports these instead of redefining the
// interface in every per-country data file.
//
// Distinct from TikTokReport (tiktok-report-types.ts): a country report's topics span every
// category (no cat_l1 filter), so each topic carries its own `category`, unlike a niche report
// where `category` is a single page-level value.

export interface TopicFactCountry {
  topic: string;
  category: string; // cat_l1 of this topic (mixed across the report, unlike a niche page)
  subcategory: string; // cat_l2
  growthMultiplier: number;
  trust: "high" | "med" | "low" | "none";
  videoNum: number | null; // null = not reported by TikTok (video_num=0)
  topCountries: string[];
}

export interface TikTokCountryReport {
  country: string; // display name, e.g. "United States"
  countryCode: string; // ISO-2 region code, e.g. "US"
  computedAt: string; // ISO, UTC
  windowEnd: string; // date, growth window end
  windowStart: string; // date, growth window start (21d)
  updatedAt: string; // date, page "last updated"
  topics: TopicFactCountry[];
  methodologyNote: string;
  highlightTopic: {
    topic: string;
    audience: string; // dominant audience segment
  };
}
