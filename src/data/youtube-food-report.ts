// Single source of truth for the YouTube Food channel growth report.
// Data pulled 2026-09-29 from ClickHouse `vira_analytics.channels_latest_mat`
// (topic contains "Food" with at most one other YouTube topic tag, subscribers >= 50,000,
// had at least 20,000 subscribers before the last 30 days, 30-day history complete,
// latest_stat_date within the last 3 days). growthPct = subsGained30d / (subscribers - subsGained30d) * 100.
// This is a manual snapshot (not yet on the daily pipeline that TikTok reports use) — see
// methodology page and Research note for the next step (automate like scripts/generate-reports.py).
// The same object feeds the human-readable page, /llms-full.txt and the JSON-LD blocks, so a
// change here changes all three at once (no drift between "visible" and "AI-facing" content).

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

export const youtubeFoodReport: YoutubeNicheReport = {
  niche: "Food",
  region: "global",
  dataAsOf: "2026-09-28",
  updatedAt: "2026-09-29",
  channels: [
    {
      channelName: "Be Smart With Palak",
      channelUrl: "https://www.youtube.com/channel/UCqWijlzf_ulS1O3Bd7WEb0Q",
      topic: "Lifestyle (sociology), Food",
      subscribers: 182000,
      subsGained30d: 117500,
      growthPct: 182.2,
      viewsGained30d: 16781074,
      channelCreatedAt: "2016-12-12",
    },
    {
      channelName: "Foodies by Tanya",
      channelUrl: "https://www.youtube.com/channel/UCOu4dY39ysAMm6zdPnHo-ew",
      topic: "Lifestyle (sociology), Food",
      subscribers: 119000,
      subsGained30d: 65600,
      growthPct: 122.8,
      viewsGained30d: 27436955,
      channelCreatedAt: "2022-02-14",
    },
    {
      channelName: "Vitality Desserts",
      channelUrl: "https://www.youtube.com/channel/UC4_XQgzwH0Xbt0ld4cn4xPQ",
      topic: "Food, Lifestyle (sociology)",
      subscribers: 65400,
      subsGained30d: 35000,
      growthPct: 115.1,
      viewsGained30d: 8072285,
      channelCreatedAt: "2026-02-03",
    },
    {
      channelName: "Asjad Tech",
      channelUrl: "https://www.youtube.com/channel/UCeZLS6OQx1N4UXz-lukFbIA",
      topic: "Food, Lifestyle (sociology)",
      subscribers: 75700,
      subsGained30d: 37300,
      growthPct: 97.1,
      viewsGained30d: 26295738,
      channelCreatedAt: "2024-02-20",
    },
    {
      channelName: "LouLouexplores",
      channelUrl: "https://www.youtube.com/channel/UCLmISWTaKC5JTFEdajIxrgw",
      topic: "Lifestyle (sociology), Food",
      subscribers: 52300,
      subsGained30d: 25100,
      growthPct: 92.3,
      viewsGained30d: 7727942,
      channelCreatedAt: "2018-10-21",
    },
    {
      channelName: "Koko Panda",
      channelUrl: "https://www.youtube.com/channel/UCypANQvu4TLWVNBbQ60TX6Q",
      topic: "Lifestyle (sociology), Food",
      subscribers: 322000,
      subsGained30d: 148000,
      growthPct: 85.1,
      viewsGained30d: 4116493,
      channelCreatedAt: "2020-03-16",
    },
    {
      channelName: "ColoredKitchen",
      channelUrl: "https://www.youtube.com/channel/UCmGCy8Ex3khBjDjbXletUfw",
      topic: "Lifestyle (sociology), Food",
      subscribers: 64400,
      subsGained30d: 27900,
      growthPct: 76.4,
      viewsGained30d: 6913588,
      channelCreatedAt: "2014-01-14",
    },
    {
      channelName: "Sumaiya Saifi Lifestyle Vlog",
      channelUrl: "https://www.youtube.com/channel/UCfm66b9VPe2NgVGzxwLzmuw",
      topic: "Lifestyle (sociology), Food",
      subscribers: 252000,
      subsGained30d: 106000,
      growthPct: 72.6,
      viewsGained30d: 20765044,
      channelCreatedAt: "2026-03-14",
    },
    {
      channelName: "Tèo Tên Tây",
      channelUrl: "https://www.youtube.com/channel/UCVsIYblFfN78t9225j2Cl0g",
      topic: "Food, Lifestyle (sociology)",
      subscribers: 189000,
      subsGained30d: 79000,
      growthPct: 71.8,
      viewsGained30d: 11339066,
      channelCreatedAt: "2023-10-07",
    },
    {
      channelName: "Popular Street Food",
      channelUrl: "https://www.youtube.com/channel/UC7I5RKFJ01NJHHeYv1bzLvA",
      topic: "Food, Lifestyle (sociology)",
      subscribers: 73300,
      subsGained30d: 23800,
      growthPct: 48.1,
      viewsGained30d: 226430309,
      channelCreatedAt: "2025-10-03",
    },
  ],
  methodologyNote:
    "YouTube public channel statistics (subscribers, views), collected daily by Vira's own channel-tracking pipeline. Growth % = subscribers gained in the last 30 days divided by the subscriber count 30 days ago, shown only for channels with a complete 30-day history and at least 50,000 current subscribers. Topic is YouTube's own classification for the channel, not Vira's; channels with more than 2 topic tags are excluded to keep the niche match tight.",
  highlightChannel: {
    channelName: "Be Smart With Palak",
    note: "an established channel (created 2016) that gained 117,500 subscribers in 30 days, more than its entire subscriber base a month earlier",
  },
};
