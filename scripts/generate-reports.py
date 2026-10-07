#!/usr/bin/env python3
"""Regenerate src/data/<niche>-report.ts from csi.v_topic_metrics (GG-724).

Read-only against ClickHouse (SELECT only). Run daily by
vira-trends-reports.service, after CSI's nightly collection + load finishes
(~04:21 UTC), on server vira.

Usage:
    generate-reports.py [--niche all|gourmet|...] [--country all|us|...]
                        [--subcategory all|gourmet-food-tutorials|...] [--out-dir DIR]

`--niche all`, `--country all` and `--subcategory all` (all three the default) regenerate every
niche in NICHES, every country in COUNTRIES and every subcategory in SUBCATEGORIES in the same
run (category, geography, and category-within-category — see COUNTRIES/SUBCATEGORIES for why
only some countries/subcategories have an entry). A bad niche, country or subcategory (too few
rows, stale/failed query) is skipped with an error on stderr; everything else in the same run
still gets published. The whole run only exits non-zero if everything failed.

Env (same names as /var/lib/csi/csi-ch-loader/.env, load with
`set -a; . .env; set +a` before running, or export directly):
    CSI_CH_URL        e.g. http://127.0.0.1:8123
    CSI_CH_USER
    CSI_CH_PASSWORD
    CSI_CH_DATABASE   csi

For a single niche, nothing is written and that niche is skipped if its
query fails or returns too few rows, so a bad day never publishes broken
data for that niche.
"""
from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone

import requests

MIN_TOPICS = 5  # fewer rows than this: refuse to publish, something's wrong upstream

TOPICS_QUERY = """
SELECT query_id, query_text, cat_l2, growth, trust, video_num, top_countries,
       win_start, win_end, computed_at
FROM v_topic_metrics
WHERE region = 'global' AND cat_l1 = {cat_l1:String} AND growth_reason = 'ok'
  AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
ORDER BY growth DESC
LIMIT 10
FORMAT TSV
"""

# Country reports (GG-724 geography expansion): top-10 growing topics *in* one country, mixing
# every category (no cat_l1 filter) — a different axis from the per-niche reports above, which
# stay region='global' and filter by category instead.
COUNTRY_TOPICS_QUERY = """
SELECT query_id, query_text, cat_l1, cat_l2, growth, trust, video_num, top_countries,
       win_start, win_end, computed_at
FROM v_topic_metrics
WHERE region = {region:String} AND growth_reason = 'ok'
  AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
ORDER BY growth DESC
LIMIT 10
FORMAT TSV
"""

# Subcategory reports (GG-724 subcategory expansion): top-10 growing topics within one cat_l2,
# nested inside one of the 24 existing cat_l1 niches above — a narrower cut of the same niche
# query, fixing cat_l2 in addition to cat_l1. No cat_l2 column in the SELECT: it's fixed for the
# whole page, so it would just repeat the page title on every row.
SUBCATEGORY_TOPICS_QUERY = """
SELECT query_id, query_text, growth, trust, video_num, top_countries,
       win_start, win_end, computed_at
FROM v_topic_metrics
WHERE region = 'global' AND cat_l1 = {cat_l1:String} AND cat_l2 = {cat_l2:String}
  AND growth_reason = 'ok' AND trust = 'high' AND quantized = 0 AND coarse = 0 AND shared_n = 0
ORDER BY growth DESC
LIMIT 10
FORMAT TSV
"""

AUDIENCE_QUERY = """
SELECT age, gender, location
FROM topic_population_dominant
WHERE query_id = {query_id:String}
ORDER BY ts DESC
LIMIT 1
FORMAT TSV
"""

METHODOLOGY_NOTE = (
    "TikTok Creative Center data, collected by Vira's own account via Creative Search Insights. "
    "Growth = 7/14/21-day median vs. prior period, shown only when trust is medium or high. "
    'Video count as reported by TikTok; "not reported" (video_num=0) means TikTok did not report a '
    "count for that topic, not zero competition. Updated daily."
)

COUNTRY_METHODOLOGY_NOTE = (
    "TikTok Creative Center data, collected by Vira's own account via Creative Search Insights, "
    "filtered to this country's own search-demand series (not global demand). Mixes every "
    "category — for a single-category view across all countries, see the niche reports instead. "
    "Growth = 7/14/21-day median vs. prior period, shown only when trust is medium or high. "
    'Video count as reported by TikTok; "not reported" (video_num=0) means TikTok did not report a '
    "count for that topic, not zero competition. Updated daily."
)

SUBCATEGORY_METHODOLOGY_NOTE = (
    "TikTok Creative Center data, collected by Vira's own account via Creative Search Insights, "
    "filtered to this one subcategory within its parent niche (TikTok's own two-level category "
    "taxonomy). Growth = 7/14/21-day median vs. prior period, shown only when trust is medium or "
    'high. Video count as reported by TikTok; "not reported" (video_num=0) means TikTok did not '
    "report a count for that topic, not zero competition. Updated daily."
)


@dataclass(frozen=True)
class Niche:
    key: str            # CLI --niche value
    category: str       # display name, e.g. "Gourmet"
    cat_l1: str          # csi.v_topic_metrics.cat_l1 filter value
    export_name: str     # exported TS const, e.g. gourmetReport
    out_file: str        # relative to repo src/data/


NICHES: dict[str, Niche] = {
    "gourmet": Niche(
        key="gourmet",
        category="Gourmet",
        cat_l1="Gourmet",
        export_name="gourmetReport",
        out_file="gourmet-report.ts",
    ),
    "science-technology": Niche(
        key="science-technology",
        category="Science and Technology",
        cat_l1="Science and Technology",
        export_name="scienceTechnologyReport",
        out_file="tiktok-science-technology-report.ts",
    ),
    "fashion": Niche(
        key="fashion",
        category="Fashion",
        cat_l1="Fashion",
        export_name="fashionReport",
        out_file="tiktok-fashion-report.ts",
    ),
    "hobbies": Niche(
        key="hobbies",
        category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        export_name="hobbiesReport",
        out_file="tiktok-hobbies-report.ts",
    ),
    "sports": Niche(
        key="sports",
        category="Sports",
        cat_l1="Sports",
        export_name="sportsReport",
        out_file="tiktok-sports-report.ts",
    ),
    "vehicles": Niche(
        key="vehicles",
        category="Vehicles & Transportation",
        cat_l1="Vehicles & Transportation",
        export_name="vehiclesReport",
        out_file="tiktok-vehicles-report.ts",
    ),
    "household": Niche(
        key="household",
        category="Household",
        cat_l1="Household",
        export_name="householdReport",
        out_file="tiktok-household-report.ts",
    ),
    "tourism": Niche(
        key="tourism",
        category="Tourism",
        cat_l1="Tourism",
        export_name="tourismReport",
        out_file="tiktok-tourism-report.ts",
    ),
    "education": Niche(
        key="education",
        category="Education",
        cat_l1="Education",
        export_name="educationReport",
        out_file="tiktok-education-report.ts",
    ),
    "dance": Niche(
        key="dance",
        category="Dance",
        cat_l1="Dance",
        export_name="danceReport",
        out_file="tiktok-dance-report.ts",
    ),
    "featured-content": Niche(
        key="featured-content",
        category="Featured Content",
        cat_l1="TikTok's Featured Content",
        export_name="featuredContentReport",
        out_file="tiktok-featured-content-report.ts",
    ),
    "workplace": Niche(
        key="workplace",
        category="Workplace",
        cat_l1="Workplace",
        export_name="workplaceReport",
        out_file="tiktok-workplace-report.ts",
    ),
    "local-life": Niche(
        key="local-life",
        category="Local Life",
        cat_l1="Local Life",
        export_name="localLifeReport",
        out_file="tiktok-local-life-report.ts",
    ),
    "acgn": Niche(
        key="acgn",
        category="ACGN (Anime, Comics, Games & Novels)",
        cat_l1="ACGN",
        export_name="acgnReport",
        out_file="tiktok-acgn-report.ts",
    ),
    "science-facts": Niche(
        key="science-facts",
        category="Science Knowledge",
        cat_l1="Science Knowledge",
        export_name="scienceFactsReport",
        out_file="tiktok-science-facts-report.ts",
    ),
    "entertainment": Niche(
        key="entertainment",
        category="Entertainment",
        cat_l1="Entertainment",
        export_name="entertainmentReport",
        out_file="tiktok-entertainment-report.ts",
    ),
    "relationships": Niche(
        key="relationships",
        category="Relationship and Psychology",
        cat_l1="Relationship and Psychology",
        export_name="relationshipsReport",
        out_file="tiktok-relationships-report.ts",
    ),
    "culture": Niche(
        key="culture",
        category="Culture",
        cat_l1="Culture",
        export_name="cultureReport",
        out_file="tiktok-culture-report.ts",
    ),
    "healthcare": Niche(
        key="healthcare",
        category="Healthcare",
        cat_l1="Healthcare",
        export_name="healthcareReport",
        out_file="tiktok-healthcare-report.ts",
    ),
    "parenting": Niche(
        key="parenting",
        category="Nursing and Parenting",
        cat_l1="Nursing and Parenting",
        export_name="parentingReport",
        out_file="tiktok-parenting-report.ts",
    ),
    "finance": Niche(
        key="finance",
        category="Finance and Economics",
        cat_l1="Finance and Economics",
        export_name="financeReport",
        out_file="tiktok-finance-report.ts",
    ),
    "music": Niche(
        key="music",
        category="Music",
        cat_l1="Music",
        export_name="musicReport",
        out_file="tiktok-music-report.ts",
    ),
    "media-accounts": Niche(
        key="media-accounts",
        category="Media Accounts",
        cat_l1="Media Accounts",
        export_name="mediaAccountsReport",
        out_file="tiktok-media-accounts-report.ts",
    ),
    "society": Niche(
        key="society",
        category="Society",
        cat_l1="Society",
        export_name="societyReport",
        out_file="tiktok-society-report.ts",
    ),
}


@dataclass(frozen=True)
class Country:
    key: str            # CLI --country value, e.g. "us"
    name: str            # display name, e.g. "United States"
    code: str            # csi.v_topic_metrics.region filter value, e.g. "US"
    export_name: str     # exported TS const, e.g. usCountryReport
    out_file: str        # relative to repo src/data/


# Curated from a live count of region='<code>' rows passing the same quality filters as the
# niche query above (growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0), run
# against csi.v_topic_metrics on 2026-10-07. Threshold: >=200 such rows, so a day-to-day top 10
# is drawn from a comfortably large pool rather than flickering on a handful of topics. That cut
# kept 18 countries (2276 rows for ID down to 215 for EG) and dropped the rest — including DE at
# 193 rows, just under the line, consistent with DE being a known thinner-series market. See
# Research/2026-10-07 GG-724 TikTok-отчёты по странам.md for the full count-per-region table.
COUNTRIES: dict[str, Country] = {
    "id": Country(key="id", name="Indonesia", code="ID", export_name="idCountryReport", out_file="tiktok-country-id-report.ts"),
    "ph": Country(key="ph", name="Philippines", code="PH", export_name="phCountryReport", out_file="tiktok-country-ph-report.ts"),
    "us": Country(key="us", name="United States", code="US", export_name="usCountryReport", out_file="tiktok-country-us-report.ts"),
    "br": Country(key="br", name="Brazil", code="BR", export_name="brCountryReport", out_file="tiktok-country-br-report.ts"),
    "mx": Country(key="mx", name="Mexico", code="MX", export_name="mxCountryReport", out_file="tiktok-country-mx-report.ts"),
    "gb": Country(key="gb", name="United Kingdom", code="GB", export_name="gbCountryReport", out_file="tiktok-country-gb-report.ts"),
    "vn": Country(key="vn", name="Vietnam", code="VN", export_name="vnCountryReport", out_file="tiktok-country-vn-report.ts"),
    "my": Country(key="my", name="Malaysia", code="MY", export_name="myCountryReport", out_file="tiktok-country-my-report.ts"),
    "bd": Country(key="bd", name="Bangladesh", code="BD", export_name="bdCountryReport", out_file="tiktok-country-bd-report.ts"),
    "pk": Country(key="pk", name="Pakistan", code="PK", export_name="pkCountryReport", out_file="tiktok-country-pk-report.ts"),
    "ca": Country(key="ca", name="Canada", code="CA", export_name="caCountryReport", out_file="tiktok-country-ca-report.ts"),
    "ng": Country(key="ng", name="Nigeria", code="NG", export_name="ngCountryReport", out_file="tiktok-country-ng-report.ts"),
    "mm": Country(key="mm", name="Myanmar", code="MM", export_name="mmCountryReport", out_file="tiktok-country-mm-report.ts"),
    "za": Country(key="za", name="South Africa", code="ZA", export_name="zaCountryReport", out_file="tiktok-country-za-report.ts"),
    "au": Country(key="au", name="Australia", code="AU", export_name="auCountryReport", out_file="tiktok-country-au-report.ts"),
    "sa": Country(key="sa", name="Saudi Arabia", code="SA", export_name="saCountryReport", out_file="tiktok-country-sa-report.ts"),
    "th": Country(key="th", name="Thailand", code="TH", export_name="thCountryReport", out_file="tiktok-country-th-report.ts"),
    "eg": Country(key="eg", name="Egypt", code="EG", export_name="egCountryReport", out_file="tiktok-country-eg-report.ts"),
}


@dataclass(frozen=True)
class Subcategory:
    key: str              # CLI --subcategory value, e.g. "gourmet-food-tutorials"
    subcategory: str      # display name, e.g. "Food Tutorials"
    parent_key: str       # Niche.key this nests under, e.g. "gourmet"
    parent_category: str  # Niche.category display name, e.g. "Gourmet"
    cat_l1: str            # csi.v_topic_metrics.cat_l1 filter value
    cat_l2: str            # csi.v_topic_metrics.cat_l2 filter value
    export_name: str       # exported TS const, e.g. gourmetFoodTutorialsSubReport
    out_file: str          # relative to repo src/data/


# Curated from a live count of (cat_l1, cat_l2) pairs passing the same quality filters as the
# niche query above (growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0), run
# against csi.v_topic_metrics on 2026-10-07, restricted to cat_l1 values already covered by
# NICHES. Threshold: >=5 such rows (MIN_TOPICS, same runtime floor as niches/countries) — 94
# (cat_l1, cat_l2) pairs cleared it. Of those, 5 niches (Finance and Economics, Media Accounts,
# Music, Nursing and Parenting, Society) had exactly one qualifying subcategory, which would
# just duplicate that niche's own top-10 one-for-one; those 5 are excluded here, leaving 89
# subcategories across the other 19 niches. See Research/2026-10-07 GG-724
# TikTok-подкатегории.md for the full count-per-(cat_l1, cat_l2) table.
SUBCATEGORIES: dict[str, Subcategory] = {
    "acgn-animation-and-comics": Subcategory(
        key="acgn-animation-and-comics",
        subcategory="Animation and Comics",
        parent_key="acgn",
        parent_category="ACGN (Anime, Comics, Games & Novels)",
        cat_l1="ACGN",
        cat_l2="Animation and Comics",
        export_name="acgnAnimationAndComicsSubReport",
        out_file="tiktok-sub-acgn-animation-and-comics-report.ts",
    ),
    "acgn-games": Subcategory(
        key="acgn-games",
        subcategory="Games",
        parent_key="acgn",
        parent_category="ACGN (Anime, Comics, Games & Novels)",
        cat_l1="ACGN",
        cat_l2="Games",
        export_name="acgnGamesSubReport",
        out_file="tiktok-sub-acgn-games-report.ts",
    ),
    "culture-religion": Subcategory(
        key="culture-religion",
        subcategory="Religion",
        parent_key="culture",
        parent_category="Culture",
        cat_l1="Culture",
        cat_l2="Religion",
        export_name="cultureReligionSubReport",
        out_file="tiktok-sub-culture-religion-report.ts",
    ),
    "culture-serious-literature": Subcategory(
        key="culture-serious-literature",
        subcategory="Serious Literature",
        parent_key="culture",
        parent_category="Culture",
        cat_l1="Culture",
        cat_l2="Serious Literature",
        export_name="cultureSeriousLiteratureSubReport",
        out_file="tiktok-sub-culture-serious-literature-report.ts",
    ),
    "culture-traditions-and-culture": Subcategory(
        key="culture-traditions-and-culture",
        subcategory="Traditions and Culture",
        parent_key="culture",
        parent_category="Culture",
        cat_l1="Culture",
        cat_l2="Traditions and Culture",
        export_name="cultureTraditionsAndCultureSubReport",
        out_file="tiktok-sub-culture-traditions-and-culture-report.ts",
    ),
    "culture-other-culture-content": Subcategory(
        key="culture-other-culture-content",
        subcategory="Other Culture Content",
        parent_key="culture",
        parent_category="Culture",
        cat_l1="Culture",
        cat_l2="Other Culture Content",
        export_name="cultureOtherCultureContentSubReport",
        out_file="tiktok-sub-culture-other-culture-content-report.ts",
    ),
    "dance-dance-trend": Subcategory(
        key="dance-dance-trend",
        subcategory="Dance Trend",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Dance Trend",
        export_name="danceDanceTrendSubReport",
        out_file="tiktok-sub-dance-dance-trend-report.ts",
    ),
    "dance-dance-tutorial": Subcategory(
        key="dance-dance-tutorial",
        subcategory="Dance Tutorial",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Dance Tutorial",
        export_name="danceDanceTutorialSubReport",
        out_file="tiktok-sub-dance-dance-tutorial-report.ts",
    ),
    "dance-pop-dance": Subcategory(
        key="dance-pop-dance",
        subcategory="Pop Dance",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Pop Dance",
        export_name="dancePopDanceSubReport",
        out_file="tiktok-sub-dance-pop-dance-report.ts",
    ),
    "dance-other-dance-content": Subcategory(
        key="dance-other-dance-content",
        subcategory="Other Dance Content",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Other Dance Content",
        export_name="danceOtherDanceContentSubReport",
        out_file="tiktok-sub-dance-other-dance-content-report.ts",
    ),
    "dance-other-dance-style": Subcategory(
        key="dance-other-dance-style",
        subcategory="Other Dance Style",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Other Dance Style",
        export_name="danceOtherDanceStyleSubReport",
        out_file="tiktok-sub-dance-other-dance-style-report.ts",
    ),
    "dance-professional-dance": Subcategory(
        key="dance-professional-dance",
        subcategory="Professional Dance",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Professional Dance",
        export_name="danceProfessionalDanceSubReport",
        out_file="tiktok-sub-dance-professional-dance-report.ts",
    ),
    "dance-live-dance-performance": Subcategory(
        key="dance-live-dance-performance",
        subcategory="Live Dance Performance",
        parent_key="dance",
        parent_category="Dance",
        cat_l1="Dance",
        cat_l2="Live Dance Performance",
        export_name="danceLiveDancePerformanceSubReport",
        out_file="tiktok-sub-dance-live-dance-performance-report.ts",
    ),
    "education-language-learning": Subcategory(
        key="education-language-learning",
        subcategory="Language Learning",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="Language Learning",
        export_name="educationLanguageLearningSubReport",
        out_file="tiktok-sub-education-language-learning-report.ts",
    ),
    "education-school-education": Subcategory(
        key="education-school-education",
        subcategory="School Education",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="School Education",
        export_name="educationSchoolEducationSubReport",
        out_file="tiktok-sub-education-school-education-report.ts",
    ),
    "education-education-others": Subcategory(
        key="education-education-others",
        subcategory="Education - Others",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="Education - Others",
        export_name="educationEducationOthersSubReport",
        out_file="tiktok-sub-education-education-others-report.ts",
    ),
    "education-campus-life": Subcategory(
        key="education-campus-life",
        subcategory="Campus Life",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="Campus Life",
        export_name="educationCampusLifeSubReport",
        out_file="tiktok-sub-education-campus-life-report.ts",
    ),
    "education-education-supplies": Subcategory(
        key="education-education-supplies",
        subcategory="Education Supplies",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="Education Supplies",
        export_name="educationEducationSuppliesSubReport",
        out_file="tiktok-sub-education-education-supplies-report.ts",
    ),
    "education-online-education": Subcategory(
        key="education-online-education",
        subcategory="Online Education",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="Online Education",
        export_name="educationOnlineEducationSubReport",
        out_file="tiktok-sub-education-online-education-report.ts",
    ),
    "education-vocational-license-exams": Subcategory(
        key="education-vocational-license-exams",
        subcategory="Vocational License/Exams",
        parent_key="education",
        parent_category="Education",
        cat_l1="Education",
        cat_l2="Vocational License/Exams",
        export_name="educationVocationalLicenseExamsSubReport",
        out_file="tiktok-sub-education-vocational-license-exams-report.ts",
    ),
    "entertainment-films-and-tvs": Subcategory(
        key="entertainment-films-and-tvs",
        subcategory="Films and TVs",
        parent_key="entertainment",
        parent_category="Entertainment",
        cat_l1="Entertainment",
        cat_l2="Films and TVs",
        export_name="entertainmentFilmsAndTvsSubReport",
        out_file="tiktok-sub-entertainment-films-and-tvs-report.ts",
    ),
    "entertainment-celebrity-entertainment": Subcategory(
        key="entertainment-celebrity-entertainment",
        subcategory="Celebrity Entertainment",
        parent_key="entertainment",
        parent_category="Entertainment",
        cat_l1="Entertainment",
        cat_l2="Celebrity Entertainment",
        export_name="entertainmentCelebrityEntertainmentSubReport",
        out_file="tiktok-sub-entertainment-celebrity-entertainment-report.ts",
    ),
    "fashion-fashion-tutorials": Subcategory(
        key="fashion-fashion-tutorials",
        subcategory="Fashion Tutorials",
        parent_key="fashion",
        parent_category="Fashion",
        cat_l1="Fashion",
        cat_l2="Fashion Tutorials",
        export_name="fashionFashionTutorialsSubReport",
        out_file="tiktok-sub-fashion-fashion-tutorials-report.ts",
    ),
    "fashion-fashion-products": Subcategory(
        key="fashion-fashion-products",
        subcategory="Fashion Products",
        parent_key="fashion",
        parent_category="Fashion",
        cat_l1="Fashion",
        cat_l2="Fashion Products",
        export_name="fashionFashionProductsSubReport",
        out_file="tiktok-sub-fashion-fashion-products-report.ts",
    ),
    "fashion-fashion-news": Subcategory(
        key="fashion-fashion-news",
        subcategory="Fashion News",
        parent_key="fashion",
        parent_category="Fashion",
        cat_l1="Fashion",
        cat_l2="Fashion News",
        export_name="fashionFashionNewsSubReport",
        out_file="tiktok-sub-fashion-fashion-news-report.ts",
    ),
    "featured-content-others-tiktok-and-video-contents": Subcategory(
        key="featured-content-others-tiktok-and-video-contents",
        subcategory="Others TikTok and Video Contents",
        parent_key="featured-content",
        parent_category="Featured Content",
        cat_l1="TikTok's Featured Content",
        cat_l2="Others TikTok and Video Contents",
        export_name="featuredContentOthersTiktokAndVideoContentsSubReport",
        out_file="tiktok-sub-featured-content-others-tiktok-and-video-contents-report.ts",
    ),
    "featured-content-trends-challenges": Subcategory(
        key="featured-content-trends-challenges",
        subcategory="Trends/Challenges",
        parent_key="featured-content",
        parent_category="Featured Content",
        cat_l1="TikTok's Featured Content",
        cat_l2="Trends/Challenges",
        export_name="featuredContentTrendsChallengesSubReport",
        out_file="tiktok-sub-featured-content-trends-challenges-report.ts",
    ),
    "featured-content-life-snapshots": Subcategory(
        key="featured-content-life-snapshots",
        subcategory="Life Snapshots",
        parent_key="featured-content",
        parent_category="Featured Content",
        cat_l1="TikTok's Featured Content",
        cat_l2="Life Snapshots",
        export_name="featuredContentLifeSnapshotsSubReport",
        out_file="tiktok-sub-featured-content-life-snapshots-report.ts",
    ),
    "featured-content-stories-posting-captions": Subcategory(
        key="featured-content-stories-posting-captions",
        subcategory="Stories/Posting Captions",
        parent_key="featured-content",
        parent_category="Featured Content",
        cat_l1="TikTok's Featured Content",
        cat_l2="Stories/Posting Captions",
        export_name="featuredContentStoriesPostingCaptionsSubReport",
        out_file="tiktok-sub-featured-content-stories-posting-captions-report.ts",
    ),
    "featured-content-internet": Subcategory(
        key="featured-content-internet",
        subcategory="Internet",
        parent_key="featured-content",
        parent_category="Featured Content",
        cat_l1="TikTok's Featured Content",
        cat_l2="Internet",
        export_name="featuredContentInternetSubReport",
        out_file="tiktok-sub-featured-content-internet-report.ts",
    ),
    "featured-content-audio-bgm": Subcategory(
        key="featured-content-audio-bgm",
        subcategory="Audio/BGM",
        parent_key="featured-content",
        parent_category="Featured Content",
        cat_l1="TikTok's Featured Content",
        cat_l2="Audio/BGM",
        export_name="featuredContentAudioBgmSubReport",
        out_file="tiktok-sub-featured-content-audio-bgm-report.ts",
    ),
    "gourmet-food-tutorials": Subcategory(
        key="gourmet-food-tutorials",
        subcategory="Food Tutorials",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Food Tutorials",
        export_name="gourmetFoodTutorialsSubReport",
        out_file="tiktok-sub-gourmet-food-tutorials-report.ts",
    ),
    "gourmet-offline-catering": Subcategory(
        key="gourmet-offline-catering",
        subcategory="Offline Catering",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Offline Catering",
        export_name="gourmetOfflineCateringSubReport",
        out_file="tiktok-sub-gourmet-offline-catering-report.ts",
    ),
    "gourmet-food-fmcg": Subcategory(
        key="gourmet-food-fmcg",
        subcategory="Food FMCG",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Food FMCG",
        export_name="gourmetFoodFmcgSubReport",
        out_file="tiktok-sub-gourmet-food-fmcg-report.ts",
    ),
    "gourmet-food-ingredients-fresh-food": Subcategory(
        key="gourmet-food-ingredients-fresh-food",
        subcategory="Food Ingredients/Fresh Food",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Food Ingredients/Fresh Food",
        export_name="gourmetFoodIngredientsFreshFoodSubReport",
        out_file="tiktok-sub-gourmet-food-ingredients-fresh-food-report.ts",
    ),
    "gourmet-other-gourmet": Subcategory(
        key="gourmet-other-gourmet",
        subcategory="Other Gourmet",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Other Gourmet",
        export_name="gourmetOtherGourmetSubReport",
        out_file="tiktok-sub-gourmet-other-gourmet-report.ts",
    ),
    "gourmet-food-science": Subcategory(
        key="gourmet-food-science",
        subcategory="Food Science",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Food Science",
        export_name="gourmetFoodScienceSubReport",
        out_file="tiktok-sub-gourmet-food-science-report.ts",
    ),
    "gourmet-food-festivals-activities": Subcategory(
        key="gourmet-food-festivals-activities",
        subcategory="Food Festivals/Activities",
        parent_key="gourmet",
        parent_category="Gourmet",
        cat_l1="Gourmet",
        cat_l2="Food Festivals/Activities",
        export_name="gourmetFoodFestivalsActivitiesSubReport",
        out_file="tiktok-sub-gourmet-food-festivals-activities-report.ts",
    ),
    "healthcare-modern-medicine": Subcategory(
        key="healthcare-modern-medicine",
        subcategory="Modern Medicine",
        parent_key="healthcare",
        parent_category="Healthcare",
        cat_l1="Healthcare",
        cat_l2="Modern Medicine",
        export_name="healthcareModernMedicineSubReport",
        out_file="tiktok-sub-healthcare-modern-medicine-report.ts",
    ),
    "healthcare-pan-health": Subcategory(
        key="healthcare-pan-health",
        subcategory="Pan-health",
        parent_key="healthcare",
        parent_category="Healthcare",
        cat_l1="Healthcare",
        cat_l2="Pan-health",
        export_name="healthcarePanHealthSubReport",
        out_file="tiktok-sub-healthcare-pan-health-report.ts",
    ),
    "hobbies-gardening-and-pet": Subcategory(
        key="hobbies-gardening-and-pet",
        subcategory="Gardening and Pet",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Gardening and Pet",
        export_name="hobbiesGardeningAndPetSubReport",
        out_file="tiktok-sub-hobbies-gardening-and-pet-report.ts",
    ),
    "hobbies-toys": Subcategory(
        key="hobbies-toys",
        subcategory="Toys",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Toys",
        export_name="hobbiesToysSubReport",
        out_file="tiktok-sub-hobbies-toys-report.ts",
    ),
    "hobbies-art-related-interests": Subcategory(
        key="hobbies-art-related-interests",
        subcategory="Art related Interests",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Art related Interests",
        export_name="hobbiesArtRelatedInterestsSubReport",
        out_file="tiktok-sub-hobbies-art-related-interests-report.ts",
    ),
    "hobbies-visual-related-interests": Subcategory(
        key="hobbies-visual-related-interests",
        subcategory="Visual related Interests",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Visual related Interests",
        export_name="hobbiesVisualRelatedInterestsSubReport",
        out_file="tiktok-sub-hobbies-visual-related-interests-report.ts",
    ),
    "hobbies-diy": Subcategory(
        key="hobbies-diy",
        subcategory="DIY",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="DIY",
        export_name="hobbiesDiySubReport",
        out_file="tiktok-sub-hobbies-diy-report.ts",
    ),
    "hobbies-other-hobbies": Subcategory(
        key="hobbies-other-hobbies",
        subcategory="Other Hobbies",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Other Hobbies",
        export_name="hobbiesOtherHobbiesSubReport",
        out_file="tiktok-sub-hobbies-other-hobbies-report.ts",
    ),
    "hobbies-board-and-chess-card-games": Subcategory(
        key="hobbies-board-and-chess-card-games",
        subcategory="Board and Chess/Card Games",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Board and Chess/Card Games",
        export_name="hobbiesBoardAndChessCardGamesSubReport",
        out_file="tiktok-sub-hobbies-board-and-chess-card-games-report.ts",
    ),
    "hobbies-performance-interests-opera-art": Subcategory(
        key="hobbies-performance-interests-opera-art",
        subcategory="Performance Interests Opera Art",
        parent_key="hobbies",
        parent_category="Personal Interests and Hobbies",
        cat_l1="Personal Interests and Hobbies",
        cat_l2="Performance Interests Opera Art",
        export_name="hobbiesPerformanceInterestsOperaArtSubReport",
        out_file="tiktok-sub-hobbies-performance-interests-opera-art-report.ts",
    ),
    "household-home-life": Subcategory(
        key="household-home-life",
        subcategory="Home Life",
        parent_key="household",
        parent_category="Household",
        cat_l1="Household",
        cat_l2="Home Life",
        export_name="householdHomeLifeSubReport",
        out_file="tiktok-sub-household-home-life-report.ts",
    ),
    "household-house-decoration": Subcategory(
        key="household-house-decoration",
        subcategory="House Decoration",
        parent_key="household",
        parent_category="Household",
        cat_l1="Household",
        cat_l2="House Decoration",
        export_name="householdHouseDecorationSubReport",
        out_file="tiktok-sub-household-house-decoration-report.ts",
    ),
    "household-real-estate": Subcategory(
        key="household-real-estate",
        subcategory="Real Estate",
        parent_key="household",
        parent_category="Household",
        cat_l1="Household",
        cat_l2="Real Estate",
        export_name="householdRealEstateSubReport",
        out_file="tiktok-sub-household-real-estate-report.ts",
    ),
    "local-life-shopping": Subcategory(
        key="local-life-shopping",
        subcategory="Shopping",
        parent_key="local-life",
        parent_category="Local Life",
        cat_l1="Local Life",
        cat_l2="Shopping",
        export_name="localLifeShoppingSubReport",
        out_file="tiktok-sub-local-life-shopping-report.ts",
    ),
    "local-life-leisure-and-entertainment": Subcategory(
        key="local-life-leisure-and-entertainment",
        subcategory="Leisure and Entertainment",
        parent_key="local-life",
        parent_category="Local Life",
        cat_l1="Local Life",
        cat_l2="Leisure and Entertainment",
        export_name="localLifeLeisureAndEntertainmentSubReport",
        out_file="tiktok-sub-local-life-leisure-and-entertainment-report.ts",
    ),
    "local-life-offline-performance": Subcategory(
        key="local-life-offline-performance",
        subcategory="Offline Performance",
        parent_key="local-life",
        parent_category="Local Life",
        cat_l1="Local Life",
        cat_l2="Offline Performance",
        export_name="localLifeOfflinePerformanceSubReport",
        out_file="tiktok-sub-local-life-offline-performance-report.ts",
    ),
    "local-life-life-services": Subcategory(
        key="local-life-life-services",
        subcategory="Life Services",
        parent_key="local-life",
        parent_category="Local Life",
        cat_l1="Local Life",
        cat_l2="Life Services",
        export_name="localLifeLifeServicesSubReport",
        out_file="tiktok-sub-local-life-life-services-report.ts",
    ),
    "local-life-sports-and-fitness": Subcategory(
        key="local-life-sports-and-fitness",
        subcategory="Sports and Fitness",
        parent_key="local-life",
        parent_category="Local Life",
        cat_l1="Local Life",
        cat_l2="Sports and Fitness",
        export_name="localLifeSportsAndFitnessSubReport",
        out_file="tiktok-sub-local-life-sports-and-fitness-report.ts",
    ),
    "local-life-galleries-and-exhibitions": Subcategory(
        key="local-life-galleries-and-exhibitions",
        subcategory="Galleries and Exhibitions",
        parent_key="local-life",
        parent_category="Local Life",
        cat_l1="Local Life",
        cat_l2="Galleries and Exhibitions",
        export_name="localLifeGalleriesAndExhibitionsSubReport",
        out_file="tiktok-sub-local-life-galleries-and-exhibitions-report.ts",
    ),
    "relationships-psychology": Subcategory(
        key="relationships-psychology",
        subcategory="Psychology",
        parent_key="relationships",
        parent_category="Relationship and Psychology",
        cat_l1="Relationship and Psychology",
        cat_l2="Psychology",
        export_name="relationshipsPsychologySubReport",
        out_file="tiktok-sub-relationships-psychology-report.ts",
    ),
    "relationships-emotional-phrase": Subcategory(
        key="relationships-emotional-phrase",
        subcategory="Emotional Phrase",
        parent_key="relationships",
        parent_category="Relationship and Psychology",
        cat_l1="Relationship and Psychology",
        cat_l2="Emotional Phrase",
        export_name="relationshipsEmotionalPhraseSubReport",
        out_file="tiktok-sub-relationships-emotional-phrase-report.ts",
    ),
    "relationships-relationship-knowledge": Subcategory(
        key="relationships-relationship-knowledge",
        subcategory="Relationship Knowledge",
        parent_key="relationships",
        parent_category="Relationship and Psychology",
        cat_l1="Relationship and Psychology",
        cat_l2="Relationship Knowledge",
        export_name="relationshipsRelationshipKnowledgeSubReport",
        out_file="tiktok-sub-relationships-relationship-knowledge-report.ts",
    ),
    "science-facts-biology-knowledge": Subcategory(
        key="science-facts-biology-knowledge",
        subcategory="Biology Knowledge",
        parent_key="science-facts",
        parent_category="Science Knowledge",
        cat_l1="Science Knowledge",
        cat_l2="Biology Knowledge",
        export_name="scienceFactsBiologyKnowledgeSubReport",
        out_file="tiktok-sub-science-facts-biology-knowledge-report.ts",
    ),
    "science-facts-geology-knowledge": Subcategory(
        key="science-facts-geology-knowledge",
        subcategory="Geology Knowledge",
        parent_key="science-facts",
        parent_category="Science Knowledge",
        cat_l1="Science Knowledge",
        cat_l2="Geology Knowledge",
        export_name="scienceFactsGeologyKnowledgeSubReport",
        out_file="tiktok-sub-science-facts-geology-knowledge-report.ts",
    ),
    "science-facts-astronomy-knowledge": Subcategory(
        key="science-facts-astronomy-knowledge",
        subcategory="Astronomy Knowledge",
        parent_key="science-facts",
        parent_category="Science Knowledge",
        cat_l1="Science Knowledge",
        cat_l2="Astronomy Knowledge",
        export_name="scienceFactsAstronomyKnowledgeSubReport",
        out_file="tiktok-sub-science-facts-astronomy-knowledge-report.ts",
    ),
    "science-facts-physics-knowledge": Subcategory(
        key="science-facts-physics-knowledge",
        subcategory="Physics Knowledge",
        parent_key="science-facts",
        parent_category="Science Knowledge",
        cat_l1="Science Knowledge",
        cat_l2="Physics Knowledge",
        export_name="scienceFactsPhysicsKnowledgeSubReport",
        out_file="tiktok-sub-science-facts-physics-knowledge-report.ts",
    ),
    "science-facts-unresolved-mysteries": Subcategory(
        key="science-facts-unresolved-mysteries",
        subcategory="Unresolved Mysteries",
        parent_key="science-facts",
        parent_category="Science Knowledge",
        cat_l1="Science Knowledge",
        cat_l2="Unresolved Mysteries",
        export_name="scienceFactsUnresolvedMysteriesSubReport",
        out_file="tiktok-sub-science-facts-unresolved-mysteries-report.ts",
    ),
    "science-facts-science-knowledge-others": Subcategory(
        key="science-facts-science-knowledge-others",
        subcategory="Science Knowledge - Others",
        parent_key="science-facts",
        parent_category="Science Knowledge",
        cat_l1="Science Knowledge",
        cat_l2="Science Knowledge - Others",
        export_name="scienceFactsScienceKnowledgeOthersSubReport",
        out_file="tiktok-sub-science-facts-science-knowledge-others-report.ts",
    ),
    "science-technology-software": Subcategory(
        key="science-technology-software",
        subcategory="Software",
        parent_key="science-technology",
        parent_category="Science and Technology",
        cat_l1="Science and Technology",
        cat_l2="Software",
        export_name="scienceTechnologySoftwareSubReport",
        out_file="tiktok-sub-science-technology-software-report.ts",
    ),
    "science-technology-internet": Subcategory(
        key="science-technology-internet",
        subcategory="Internet",
        parent_key="science-technology",
        parent_category="Science and Technology",
        cat_l1="Science and Technology",
        cat_l2="Internet",
        export_name="scienceTechnologyInternetSubReport",
        out_file="tiktok-sub-science-technology-internet-report.ts",
    ),
    "science-technology-digital": Subcategory(
        key="science-technology-digital",
        subcategory="Digital",
        parent_key="science-technology",
        parent_category="Science and Technology",
        cat_l1="Science and Technology",
        cat_l2="Digital",
        export_name="scienceTechnologyDigitalSubReport",
        out_file="tiktok-sub-science-technology-digital-report.ts",
    ),
    "science-technology-web-recources-download": Subcategory(
        key="science-technology-web-recources-download",
        subcategory="Web Recources Download",
        parent_key="science-technology",
        parent_category="Science and Technology",
        cat_l1="Science and Technology",
        cat_l2="Web Recources Download",
        export_name="scienceTechnologyWebRecourcesDownloadSubReport",
        out_file="tiktok-sub-science-technology-web-recources-download-report.ts",
    ),
    "science-technology-technical": Subcategory(
        key="science-technology-technical",
        subcategory="Technical",
        parent_key="science-technology",
        parent_category="Science and Technology",
        cat_l1="Science and Technology",
        cat_l2="Technical",
        export_name="scienceTechnologyTechnicalSubReport",
        out_file="tiktok-sub-science-technology-technical-report.ts",
    ),
    "sports-physical-sports": Subcategory(
        key="sports-physical-sports",
        subcategory="Physical Sports",
        parent_key="sports",
        parent_category="Sports",
        cat_l1="Sports",
        cat_l2="Physical Sports",
        export_name="sportsPhysicalSportsSubReport",
        out_file="tiktok-sub-sports-physical-sports-report.ts",
    ),
    "sports-fitness": Subcategory(
        key="sports-fitness",
        subcategory="Fitness",
        parent_key="sports",
        parent_category="Sports",
        cat_l1="Sports",
        cat_l2="Fitness",
        export_name="sportsFitnessSubReport",
        out_file="tiktok-sub-sports-fitness-report.ts",
    ),
    "sports-sports-others": Subcategory(
        key="sports-sports-others",
        subcategory="Sports - Others",
        parent_key="sports",
        parent_category="Sports",
        cat_l1="Sports",
        cat_l2="Sports - Others",
        export_name="sportsSportsOthersSubReport",
        out_file="tiktok-sub-sports-sports-others-report.ts",
    ),
    "tourism-tourism-sites": Subcategory(
        key="tourism-tourism-sites",
        subcategory="Tourism Sites",
        parent_key="tourism",
        parent_category="Tourism",
        cat_l1="Tourism",
        cat_l2="Tourism Sites",
        export_name="tourismTourismSitesSubReport",
        out_file="tiktok-sub-tourism-tourism-sites-report.ts",
    ),
    "tourism-tourist-guide": Subcategory(
        key="tourism-tourist-guide",
        subcategory="Tourist Guide",
        parent_key="tourism",
        parent_category="Tourism",
        cat_l1="Tourism",
        cat_l2="Tourist Guide",
        export_name="tourismTouristGuideSubReport",
        out_file="tiktok-sub-tourism-tourist-guide-report.ts",
    ),
    "tourism-administrative-division": Subcategory(
        key="tourism-administrative-division",
        subcategory="Administrative Division",
        parent_key="tourism",
        parent_category="Tourism",
        cat_l1="Tourism",
        cat_l2="Administrative Division",
        export_name="tourismAdministrativeDivisionSubReport",
        out_file="tiktok-sub-tourism-administrative-division-report.ts",
    ),
    "tourism-tourism-service": Subcategory(
        key="tourism-tourism-service",
        subcategory="Tourism Service",
        parent_key="tourism",
        parent_category="Tourism",
        cat_l1="Tourism",
        cat_l2="Tourism Service",
        export_name="tourismTourismServiceSubReport",
        out_file="tiktok-sub-tourism-tourism-service-report.ts",
    ),
    "tourism-tourist-supplies": Subcategory(
        key="tourism-tourist-supplies",
        subcategory="Tourist Supplies",
        parent_key="tourism",
        parent_category="Tourism",
        cat_l1="Tourism",
        cat_l2="Tourist Supplies",
        export_name="tourismTouristSuppliesSubReport",
        out_file="tiktok-sub-tourism-tourist-supplies-report.ts",
    ),
    "tourism-tourism-related-policies": Subcategory(
        key="tourism-tourism-related-policies",
        subcategory="Tourism Related Policies",
        parent_key="tourism",
        parent_category="Tourism",
        cat_l1="Tourism",
        cat_l2="Tourism Related Policies",
        export_name="tourismTourismRelatedPoliciesSubReport",
        out_file="tiktok-sub-tourism-tourism-related-policies-report.ts",
    ),
    "vehicles-transport-equipment": Subcategory(
        key="vehicles-transport-equipment",
        subcategory="Transport Equipment",
        parent_key="vehicles",
        parent_category="Vehicles & Transportation",
        cat_l1="Vehicles & Transportation",
        cat_l2="Transport Equipment",
        export_name="vehiclesTransportEquipmentSubReport",
        out_file="tiktok-sub-vehicles-transport-equipment-report.ts",
    ),
    "vehicles-traffic-services": Subcategory(
        key="vehicles-traffic-services",
        subcategory="Traffic Services",
        parent_key="vehicles",
        parent_category="Vehicles & Transportation",
        cat_l1="Vehicles & Transportation",
        cat_l2="Traffic Services",
        export_name="vehiclesTrafficServicesSubReport",
        out_file="tiktok-sub-vehicles-traffic-services-report.ts",
    ),
    "vehicles-traffic-place-names": Subcategory(
        key="vehicles-traffic-place-names",
        subcategory="Traffic Place Names",
        parent_key="vehicles",
        parent_category="Vehicles & Transportation",
        cat_l1="Vehicles & Transportation",
        cat_l2="Traffic Place Names",
        export_name="vehiclesTrafficPlaceNamesSubReport",
        out_file="tiktok-sub-vehicles-traffic-place-names-report.ts",
    ),
    "workplace-special-work-types": Subcategory(
        key="workplace-special-work-types",
        subcategory="Special Work Types",
        parent_key="workplace",
        parent_category="Workplace",
        cat_l1="Workplace",
        cat_l2="Special Work Types",
        export_name="workplaceSpecialWorkTypesSubReport",
        out_file="tiktok-sub-workplace-special-work-types-report.ts",
    ),
    "workplace-workplace-skills": Subcategory(
        key="workplace-workplace-skills",
        subcategory="Workplace Skills",
        parent_key="workplace",
        parent_category="Workplace",
        cat_l1="Workplace",
        cat_l2="Workplace Skills",
        export_name="workplaceWorkplaceSkillsSubReport",
        out_file="tiktok-sub-workplace-workplace-skills-report.ts",
    ),
    "workplace-working-industry-market": Subcategory(
        key="workplace-working-industry-market",
        subcategory="Working Industry Market",
        parent_key="workplace",
        parent_category="Workplace",
        cat_l1="Workplace",
        cat_l2="Working Industry Market",
        export_name="workplaceWorkingIndustryMarketSubReport",
        out_file="tiktok-sub-workplace-working-industry-market-report.ts",
    ),
    "workplace-other-workplace": Subcategory(
        key="workplace-other-workplace",
        subcategory="Other-Workplace",
        parent_key="workplace",
        parent_category="Workplace",
        cat_l1="Workplace",
        cat_l2="Other-Workplace",
        export_name="workplaceOtherWorkplaceSubReport",
        out_file="tiktok-sub-workplace-other-workplace-report.ts",
    ),
    "workplace-working-policies": Subcategory(
        key="workplace-working-policies",
        subcategory="Working Policies",
        parent_key="workplace",
        parent_category="Workplace",
        cat_l1="Workplace",
        cat_l2="Working Policies",
        export_name="workplaceWorkingPoliciesSubReport",
        out_file="tiktok-sub-workplace-working-policies-report.ts",
    ),
    "workplace-recruitment-information": Subcategory(
        key="workplace-recruitment-information",
        subcategory="Recruitment Information",
        parent_key="workplace",
        parent_category="Workplace",
        cat_l1="Workplace",
        cat_l2="Recruitment Information",
        export_name="workplaceRecruitmentInformationSubReport",
        out_file="tiktok-sub-workplace-recruitment-information-report.ts",
    ),
}



class ReportError(Exception):
    """Anything that should abort without touching the output file."""


def ch_query(base_url: str, user: str, password: str, database: str, query: str, params: dict) -> str:
    ch_params = {f"param_{k}": v for k, v in params.items()}
    try:
        resp = requests.post(
            base_url,
            params={"user": user, "password": password, "database": database, **ch_params},
            data=query.encode("utf-8"),
            timeout=30,
        )
    except requests.RequestException as e:
        raise ReportError(f"ClickHouse request failed: {e}") from e
    if resp.status_code != 200:
        raise ReportError(f"ClickHouse error {resp.status_code}: {resp.text.strip()[:500]}")
    return resp.text


def parse_tsv(text: str) -> list[list[str]]:
    rows = [line.split("\t") for line in text.splitlines() if line.strip()]
    return rows


def parse_ch_array(raw: str) -> list[str]:
    # ClickHouse TSV array literal, e.g. ['US','GB','PH']
    raw = raw.strip()
    if raw in ("[]", ""):
        return []
    inner = raw[1:-1]
    return [item.strip().strip("'") for item in inner.split(",") if item.strip()]


# ClickHouse's TSV output escapes apostrophes as \' (confirmed with a live query against
# cat_l1='TikTok's Featured Content', a value the country query hits often since it mixes every
# category). parse_tsv() doesn't undo this, so free-text fields in the country path need it
# unescaped before use — unlike fetch_topics()/fetch_audience() above, which niche reports have
# relied on unchanged and this doesn't touch.
_CH_TSV_UNESCAPE = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "0": "\0", "'": "'", "\\": "\\"}


def unescape_ch_tsv(s: str) -> str:
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            out.append(_CH_TSV_UNESCAPE.get(s[i + 1], s[i + 1]))
            i += 2
        else:
            out.append(s[i])
            i += 1
    return "".join(out)


def fetch_topics(base_url: str, user: str, password: str, database: str, niche: Niche) -> list[dict]:
    text = ch_query(base_url, user, password, database, TOPICS_QUERY, {"cat_l1": niche.cat_l1})
    rows = parse_tsv(text)
    topics = []
    for row in rows:
        if len(row) != 10:
            raise ReportError(f"unexpected column count in topics row: {row!r}")
        query_id, query_text, cat_l2, growth, trust, video_num, top_countries, win_start, win_end, computed_at = row
        topics.append(
            {
                "query_id": query_id,
                "topic": query_text,
                "subcategory": cat_l2 or "Uncategorized",
                "growthMultiplier": round(float(growth)),
                "trust": trust,
                "videoNum": None if video_num == "0" else int(video_num),
                "topCountries": parse_ch_array(top_countries),
                "win_start": win_start,
                "win_end": win_end,
                "computed_at": computed_at,
            }
        )
    return topics


def fetch_country_topics(base_url: str, user: str, password: str, database: str, country: Country) -> list[dict]:
    text = ch_query(base_url, user, password, database, COUNTRY_TOPICS_QUERY, {"region": country.code})
    rows = parse_tsv(text)
    topics = []
    for row in rows:
        if len(row) != 11:
            raise ReportError(f"unexpected column count in country topics row: {row!r}")
        (
            query_id,
            query_text,
            cat_l1,
            cat_l2,
            growth,
            trust,
            video_num,
            top_countries,
            win_start,
            win_end,
            computed_at,
        ) = row
        topics.append(
            {
                "query_id": query_id,
                "topic": unescape_ch_tsv(query_text),
                "category": unescape_ch_tsv(cat_l1) or "Uncategorized",
                "subcategory": unescape_ch_tsv(cat_l2) or "Uncategorized",
                "growthMultiplier": round(float(growth)),
                "trust": trust,
                "videoNum": None if video_num == "0" else int(video_num),
                "topCountries": parse_ch_array(top_countries),
                "win_start": win_start,
                "win_end": win_end,
                "computed_at": computed_at,
            }
        )
    return topics


def fetch_subcategory_topics(
    base_url: str, user: str, password: str, database: str, subcategory: Subcategory
) -> list[dict]:
    text = ch_query(
        base_url,
        user,
        password,
        database,
        SUBCATEGORY_TOPICS_QUERY,
        {"cat_l1": subcategory.cat_l1, "cat_l2": subcategory.cat_l2},
    )
    rows = parse_tsv(text)
    topics = []
    for row in rows:
        if len(row) != 9:
            raise ReportError(f"unexpected column count in subcategory topics row: {row!r}")
        query_id, query_text, growth, trust, video_num, top_countries, win_start, win_end, computed_at = row
        topics.append(
            {
                "query_id": query_id,
                "topic": unescape_ch_tsv(query_text),
                "growthMultiplier": round(float(growth)),
                "trust": trust,
                "videoNum": None if video_num == "0" else int(video_num),
                "topCountries": parse_ch_array(top_countries),
                "win_start": win_start,
                "win_end": win_end,
                "computed_at": computed_at,
            }
        )
    return topics


def fetch_audience(base_url: str, user: str, password: str, database: str, query_id: str) -> str:
    text = ch_query(base_url, user, password, database, AUDIENCE_QUERY, {"query_id": query_id})
    rows = parse_tsv(text)
    if not rows:
        return "not enough audience data for this topic"
    age, gender, location = rows[0]
    parts = [p for p in (gender, age) if p]
    who = " ".join(parts) if parts else "unspecified audience"
    where = location or "unspecified country"
    return f"{who}, {where} (dominant segment, snapshot at collection date)"


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def render_ts(niche: Niche, topics: list[dict], audience: str, updated_at: str) -> str:
    top = topics[0]
    computed_at = top["computed_at"].replace(" ", "T") + "Z"
    window_start = min(t["win_start"] for t in topics)
    window_end = max(t["win_end"] for t in topics)

    def ts_topic(t: dict) -> str:
        video_num = "null" if t["videoNum"] is None else str(t["videoNum"])
        countries = ", ".join(f'"{c}"' for c in t["topCountries"])
        topic = ts_escape(t["topic"])
        subcategory = ts_escape(t["subcategory"])
        return (
            "    {\n"
            f'      topic: "{topic}",\n'
            f'      subcategory: "{subcategory}",\n'
            f'      growthMultiplier: {t["growthMultiplier"]},\n'
            f'      trust: "{t["trust"]}",\n'
            f"      videoNum: {video_num},\n"
            f"      topCountries: [{countries}],\n"
            "    },"
        )

    topics_ts = "\n".join(ts_topic(t) for t in topics)
    top_topic_escaped = ts_escape(top["topic"])
    audience_escaped = ts_escape(audience)
    methodology_escaped = ts_escape(METHODOLOGY_NOTE)

    return f"""// Single source of truth for the {niche.category} trends report.
// Generated by scripts/generate-reports.py from ClickHouse `csi.v_topic_metrics`
// (region=global, growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0).
// Do not hand-edit the numbers here — rerun the generator instead. The same object feeds
// the human-readable page, its llms-full.txt and the JSON-LD blocks, so a change here changes
// all three at once (no drift between "visible" and "AI-facing" content).

import type {{ TikTokReport }} from "./tiktok-report-types";

export const {niche.export_name}: TikTokReport = {{
  category: "{niche.category}",
  region: "global",
  computedAt: "{computed_at}",
  windowStart: "{window_start}",
  windowEnd: "{window_end}",
  updatedAt: "{updated_at}",
  topics: [
{topics_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightTopic: {{
    topic: "{top_topic_escaped}",
    audience: "{audience_escaped}",
  }},
}};
"""


def render_country_ts(country: Country, topics: list[dict], audience: str, updated_at: str) -> str:
    top = topics[0]
    computed_at = top["computed_at"].replace(" ", "T") + "Z"
    window_start = min(t["win_start"] for t in topics)
    window_end = max(t["win_end"] for t in topics)

    def ts_topic(t: dict) -> str:
        video_num = "null" if t["videoNum"] is None else str(t["videoNum"])
        countries = ", ".join(f'"{c}"' for c in t["topCountries"])
        topic = ts_escape(t["topic"])
        category = ts_escape(t["category"])
        subcategory = ts_escape(t["subcategory"])
        return (
            "    {\n"
            f'      topic: "{topic}",\n'
            f'      category: "{category}",\n'
            f'      subcategory: "{subcategory}",\n'
            f'      growthMultiplier: {t["growthMultiplier"]},\n'
            f'      trust: "{t["trust"]}",\n'
            f"      videoNum: {video_num},\n"
            f"      topCountries: [{countries}],\n"
            "    },"
        )

    topics_ts = "\n".join(ts_topic(t) for t in topics)
    top_topic_escaped = ts_escape(top["topic"])
    audience_escaped = ts_escape(audience)
    methodology_escaped = ts_escape(COUNTRY_METHODOLOGY_NOTE)

    return f"""// Single source of truth for the TikTok trends in {country.name} report.
// Generated by scripts/generate-reports.py from ClickHouse `csi.v_topic_metrics`
// (region='{country.code}', growth_reason='ok', trust='high', quantized=0, coarse=0, shared_n=0).
// Do not hand-edit the numbers here — rerun the generator instead. The same object feeds
// the human-readable page, its llms-full.txt and the JSON-LD blocks, so a change here changes
// all three at once (no drift between "visible" and "AI-facing" content).

import type {{ TikTokCountryReport }} from "./tiktok-country-report-types";

export const {country.export_name}: TikTokCountryReport = {{
  country: "{country.name}",
  countryCode: "{country.code}",
  computedAt: "{computed_at}",
  windowStart: "{window_start}",
  windowEnd: "{window_end}",
  updatedAt: "{updated_at}",
  topics: [
{topics_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightTopic: {{
    topic: "{top_topic_escaped}",
    audience: "{audience_escaped}",
  }},
}};
"""


def render_subcategory_ts(subcategory: Subcategory, topics: list[dict], audience: str, updated_at: str) -> str:
    top = topics[0]
    computed_at = top["computed_at"].replace(" ", "T") + "Z"
    window_start = min(t["win_start"] for t in topics)
    window_end = max(t["win_end"] for t in topics)

    def ts_topic(t: dict) -> str:
        video_num = "null" if t["videoNum"] is None else str(t["videoNum"])
        countries = ", ".join(f'"{c}"' for c in t["topCountries"])
        topic = ts_escape(t["topic"])
        return (
            "    {\n"
            f'      topic: "{topic}",\n'
            f'      growthMultiplier: {t["growthMultiplier"]},\n'
            f'      trust: "{t["trust"]}",\n'
            f"      videoNum: {video_num},\n"
            f"      topCountries: [{countries}],\n"
            "    },"
        )

    topics_ts = "\n".join(ts_topic(t) for t in topics)
    top_topic_escaped = ts_escape(top["topic"])
    audience_escaped = ts_escape(audience)
    methodology_escaped = ts_escape(SUBCATEGORY_METHODOLOGY_NOTE)

    return f"""// Single source of truth for the {subcategory.subcategory} trends report (part of
// {subcategory.parent_category}).
// Generated by scripts/generate-reports.py from ClickHouse `csi.v_topic_metrics`
// (region=global, cat_l1='{subcategory.cat_l1}', cat_l2='{subcategory.cat_l2}', growth_reason='ok',
// trust='high', quantized=0, coarse=0, shared_n=0).
// Do not hand-edit the numbers here — rerun the generator instead. The same object feeds
// the human-readable page, its llms-full.txt and the JSON-LD blocks, so a change here changes
// all three at once (no drift between "visible" and "AI-facing" content).

import type {{ TikTokSubcategoryReport }} from "./tiktok-subcategory-report-types";

export const {subcategory.export_name}: TikTokSubcategoryReport = {{
  subcategory: "{ts_escape(subcategory.subcategory)}",
  parentCategory: "{ts_escape(subcategory.parent_category)}",
  parentSlug: "{subcategory.parent_key}",
  region: "global",
  computedAt: "{computed_at}",
  windowStart: "{window_start}",
  windowEnd: "{window_end}",
  updatedAt: "{updated_at}",
  topics: [
{topics_ts}
  ],
  methodologyNote:
    "{methodology_escaped}",
  highlightTopic: {{
    topic: "{top_topic_escaped}",
    audience: "{audience_escaped}",
  }},
}};
"""


def generate(niche: Niche, out_dir: str, base_url: str, user: str, password: str, database: str) -> str:
    topics = fetch_topics(base_url, user, password, database, niche)
    if len(topics) < MIN_TOPICS:
        raise ReportError(
            f"only {len(topics)} topics for niche={niche.key} (need >= {MIN_TOPICS}); refusing to publish"
        )

    audience = fetch_audience(base_url, user, password, database, topics[0]["query_id"])
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    ts_content = render_ts(niche, topics, audience, updated_at)

    out_path = os.path.join(out_dir, niche.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


def generate_country(country: Country, out_dir: str, base_url: str, user: str, password: str, database: str) -> str:
    topics = fetch_country_topics(base_url, user, password, database, country)
    if len(topics) < MIN_TOPICS:
        raise ReportError(
            f"only {len(topics)} topics for country={country.key} (need >= {MIN_TOPICS}); refusing to publish"
        )

    audience = unescape_ch_tsv(fetch_audience(base_url, user, password, database, topics[0]["query_id"]))
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    ts_content = render_country_ts(country, topics, audience, updated_at)

    out_path = os.path.join(out_dir, country.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


def generate_subcategory(
    subcategory: Subcategory, out_dir: str, base_url: str, user: str, password: str, database: str
) -> str:
    topics = fetch_subcategory_topics(base_url, user, password, database, subcategory)
    if len(topics) < MIN_TOPICS:
        raise ReportError(
            f"only {len(topics)} topics for subcategory={subcategory.key} "
            f"(need >= {MIN_TOPICS}); refusing to publish"
        )

    audience = unescape_ch_tsv(fetch_audience(base_url, user, password, database, topics[0]["query_id"]))
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    ts_content = render_subcategory_ts(subcategory, topics, audience, updated_at)

    out_path = os.path.join(out_dir, subcategory.out_file)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts_content)
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--niche", default="all", choices=sorted(NICHES) + ["all"])
    parser.add_argument("--country", default="all", choices=sorted(COUNTRIES) + ["all"])
    parser.add_argument("--subcategory", default="all", choices=sorted(SUBCATEGORIES) + ["all"])
    parser.add_argument(
        "--out-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data"),
        help=(
            "directory to write <niche>-report.ts / tiktok-country-<code>-report.ts / "
            "tiktok-sub-<slug>-report.ts into (default: repo's src/data)"
        ),
    )
    args = parser.parse_args()

    try:
        base_url = os.environ["CSI_CH_URL"]
        user = os.environ["CSI_CH_USER"]
        password = os.environ["CSI_CH_PASSWORD"]
        database = os.environ.get("CSI_CH_DATABASE", "csi")
    except KeyError as e:
        print(f"generate-reports: missing required env var {e}", file=sys.stderr)
        return 1

    niches = list(NICHES.values()) if args.niche == "all" else [NICHES[args.niche]]
    countries = list(COUNTRIES.values()) if args.country == "all" else [COUNTRIES[args.country]]
    subcategories = list(SUBCATEGORIES.values()) if args.subcategory == "all" else [SUBCATEGORIES[args.subcategory]]

    ok_count = 0
    for niche in niches:
        try:
            out_path = generate(niche, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: niche={niche.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    for country in countries:
        try:
            out_path = generate_country(country, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: country={country.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    for subcategory in subcategories:
        try:
            out_path = generate_subcategory(subcategory, args.out_dir, base_url, user, password, database)
        except ReportError as e:
            print(f"generate-reports: subcategory={subcategory.key}: {e}", file=sys.stderr)
            continue
        print(f"generate-reports: wrote {out_path}")
        ok_count += 1

    if ok_count == 0:
        print("generate-reports: every niche, country and subcategory failed, nothing published", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
