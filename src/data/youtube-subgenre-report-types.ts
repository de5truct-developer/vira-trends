// Shared types for YouTube subgenre channel-growth reports (GG-724 subgenre expansion).
// Hand-written, not regenerated -- scripts/generate-youtube-reports.py imports these instead of
// redefining the interface in every per-subgenre data file.
//
// Distinct from YoutubeNicheReport (youtube-report-types.ts): a subgenre report fixes a
// narrower topic tag nested inside the Music or Gaming niche (e.g. "Pop music" inside "Music"),
// so the page carries parentCategory/parentSlug to link back to that niche.

import type { ChannelFact } from "./youtube-report-types";

export interface YoutubeSubgenreReport {
  subgenre: string; // display name, e.g. "Pop music"
  parentCategory: string; // display name of the niche, e.g. "Music"
  parentSlug: string; // niche slug, for linking back to /reports/youtube/<parentSlug>
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
