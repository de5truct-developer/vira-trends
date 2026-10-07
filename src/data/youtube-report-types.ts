// Shared types for YouTube niche channel-growth reports (GG-724). Hand-written, not
// regenerated -- scripts/generate-youtube-reports.py imports these instead of redefining
// the interface in every per-niche data file.

export interface ChannelFact {
  channelName: string;
  channelUrl: string;
  topic: string; // YouTube's own topic classification (Wikipedia-based topicCategories), not Vira's
  subscribers: number;
  subsGained30d: number;
  growthPct: number; // subsGained30d / (subscribers - subsGained30d) * 100, rounded to 1 decimal
  viewsGained30d: number;
  channelCreatedAt: string | null; // date, null if unknown
}

export interface YoutubeNicheReport {
  niche: string;
  region: string;
  dataAsOf: string; // date, latest_stat_date backing the numbers
  updatedAt: string; // date, page "last updated"
  channels: ChannelFact[];
  methodologyNote: string;
  highlightChannel: {
    channelName: string;
    note: string;
  };
}
