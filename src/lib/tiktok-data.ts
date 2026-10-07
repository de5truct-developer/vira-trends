// Shared manifest + data loading for every TikTok dynamic route (GG-724 auto-discovery).
// src/data/tiktok-<niches|countries|subcategories>-manifest.json list which niches/countries/
// subcategories are published; scripts/generate-reports.py --discover is the only thing that
// appends to them (see that script for the thresholds). Everything here just reads them, the
// same way src/pages/reports/tiktok/*.astro used to hand-import one named report per page.
import nichesManifest from "../data/tiktok-niches-manifest.json";
import countriesManifest from "../data/tiktok-countries-manifest.json";
import subcategoriesManifest from "../data/tiktok-subcategories-manifest.json";
import type { TikTokReport } from "../data/tiktok-report-types";
import type { TikTokCountryReport } from "../data/tiktok-country-report-types";
import type { TikTokSubcategoryReport } from "../data/tiktok-subcategory-report-types";

export interface NicheManifestEntry {
  slug: string;
  category: string;
  catL1: string;
  exportName: string;
  dataFile: string;
}

export interface CountryManifestEntry {
  slug: string;
  name: string;
  code: string;
  exportName: string;
  dataFile: string;
}

export interface SubcategoryManifestEntry {
  slug: string;
  subcategory: string;
  parentSlug: string;
  parentCategory: string;
  catL1: string;
  catL2: string;
  exportName: string;
  dataFile: string;
}

export const NICHES: NicheManifestEntry[] = nichesManifest;
export const COUNTRIES: CountryManifestEntry[] = countriesManifest;
export const SUBCATEGORIES: SubcategoryManifestEntry[] = subcategoriesManifest;

// Eager import of every generated report data file. Each file matched here
// (src/data/*-report.ts: niches, countries and subcategories, see
// scripts/generate-reports.py's render_ts/render_country_ts/render_subcategory_ts) exports
// exactly one report object -- looking it up by the manifest's `dataFile` field and grabbing
// that one export is what lets a brand new manifest entry "just work" without a matching
// hand-written import anywhere.
const reportModules = import.meta.glob("../data/*-report.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

function loadReport<T>(dataFile: string): T {
  const mod = reportModules[`../data/${dataFile}`];
  if (!mod) {
    throw new Error(`tiktok-data: no data module for ${dataFile} (expected ../data/${dataFile})`);
  }
  const values = Object.values(mod);
  if (values.length !== 1) {
    throw new Error(`tiktok-data: expected exactly one export in ${dataFile}, found ${values.length}`);
  }
  return values[0] as T;
}

export function loadNicheReport(entry: NicheManifestEntry): TikTokReport {
  return loadReport<TikTokReport>(entry.dataFile);
}

export function loadCountryReport(entry: CountryManifestEntry): TikTokCountryReport {
  return loadReport<TikTokCountryReport>(entry.dataFile);
}

export function loadSubcategoryReport(entry: SubcategoryManifestEntry): TikTokSubcategoryReport {
  return loadReport<TikTokSubcategoryReport>(entry.dataFile);
}

export function subcategoriesFor(nicheSlug: string): { slug: string; name: string }[] {
  return SUBCATEGORIES.filter((s) => s.parentSlug === nicheSlug).map((s) => ({
    slug: s.slug,
    name: s.subcategory,
  }));
}
