// Shared types for TikTok niche trend reports (GG-724). Hand-written, not regenerated —
// scripts/generate-reports.py imports these instead of redefining the interface in every
// per-niche data file.

export interface TopicFact {
  topic: string;
  subcategory: string;
  growthMultiplier: number;
  trust: "high" | "med" | "low" | "none";
  videoNum: number | null; // null = not reported by TikTok (video_num=0)
  topCountries: string[];
}

export interface TikTokReport {
  category: string;
  region: string;
  computedAt: string; // ISO, UTC
  windowEnd: string; // date, growth window end
  windowStart: string; // date, growth window start (21d)
  updatedAt: string; // date, page "last updated"
  topics: TopicFact[];
  methodologyNote: string;
  highlightTopic: {
    topic: string;
    audience: string; // dominant audience segment
  };
}
