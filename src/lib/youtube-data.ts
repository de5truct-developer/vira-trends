// Shared manifest + data loading for every YouTube dynamic route (GG-724 auto-discovery).
// src/data/youtube-<niches|subgenres>-manifest.json list which niches/subgenres are published;
// scripts/generate-youtube-reports.py --discover is the only thing that appends to them (see
// that script for the thresholds). Everything here just reads them, the same way
// src/pages/reports/youtube/*.astro used to hand-import one named report per page. Mirrors
// src/lib/tiktok-data.ts -- see that file for the TikTok side, untouched by this.
import nichesManifest from "../data/youtube-niches-manifest.json";
import subgenresManifest from "../data/youtube-subgenres-manifest.json";
import type { YoutubeNicheReport } from "../data/youtube-report-types";
import type { YoutubeSubgenreReport } from "../data/youtube-subgenre-report-types";

export interface NicheManifestEntry {
  slug: string;
  category: string;
  topicMatch: string;
  exportName: string;
  dataFile: string;
}

export interface SubgenreManifestEntry {
  slug: string;
  subgenre: string;
  parentSlug: string;
  parentCategory: string;
  topicMatch: string;
  exportName: string;
  dataFile: string;
}

export const NICHES: NicheManifestEntry[] = nichesManifest;
export const SUBGENRES: SubgenreManifestEntry[] = subgenresManifest;

// Eager import of every generated YouTube report data file. Each file matched here
// (src/data/youtube-*-report.ts: niches and subgenres, see scripts/generate-youtube-reports.py's
// render_ts/render_subgenre_ts) exports exactly one report object -- looking it up by the
// manifest's `dataFile` field and grabbing that one export is what lets a brand new manifest
// entry "just work" without a matching hand-written import anywhere.
const reportModules = import.meta.glob("../data/youtube-*-report.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

function loadReport<T>(dataFile: string): T {
  const mod = reportModules[`../data/${dataFile}`];
  if (!mod) {
    throw new Error(`youtube-data: no data module for ${dataFile} (expected ../data/${dataFile})`);
  }
  const values = Object.values(mod);
  if (values.length !== 1) {
    throw new Error(`youtube-data: expected exactly one export in ${dataFile}, found ${values.length}`);
  }
  return values[0] as T;
}

export function loadNicheReport(entry: NicheManifestEntry): YoutubeNicheReport {
  return loadReport<YoutubeNicheReport>(entry.dataFile);
}

export function loadSubgenreReport(entry: SubgenreManifestEntry): YoutubeSubgenreReport {
  return loadReport<YoutubeSubgenreReport>(entry.dataFile);
}

export function subgenresFor(nicheSlug: string): { slug: string; name: string }[] {
  return SUBGENRES.filter((s) => s.parentSlug === nicheSlug).map((s) => ({
    slug: s.slug,
    name: s.subgenre,
  }));
}
