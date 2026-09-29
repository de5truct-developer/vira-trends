# Vira Trend Reports

Public, AEO/GEO-oriented TikTok trend reports for GG-724. Static Astro site, separate from the
main `ggwptech/Vira` Next.js app.

- Content: English only.
- `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml` are all generated from the same
  data in `src/data/`, so the human-readable page and the AI-facing text/JSON-LD never drift
  apart.
- One example report so far: `/reports/tiktok/gourmet`, built from real `csi.v_topic_metrics`
  numbers (see the Vira Obsidian research note "2026-09-29 GG-724 скоуп и прототип AI-отчётов").

## Develop

```bash
npm install
npm run dev       # http://localhost:4321
npm run build      # outputs to dist/
npm run preview
```

## Deploy

Dockerfile builds a static bundle and serves it via nginx (`nginx.conf`), same shape as the
existing Dokploy setup for `dev.tryvira.app` (see `ggwptech/Vira/Dockerfile` for the sibling
pattern). Live at `trends.tryvira.app` (Dokploy app `vira-trends-trendssite-1yaa1d`, separate
from `vira-dev`).

## Daily data refresh

`scripts/generate-reports.py` rebuilds `src/data/gourmet-report.ts` from `csi.v_topic_metrics`
(read-only). It's run once a day on the `vira` server by
`vira-trends-reports.service`/`.timer` (06:30 UTC), which then commits, pushes (via a
repo-scoped deploy key, not a personal token) and triggers the Dokploy redeploy webhook. See
the Vira Obsidian research note "2026-09-29 GG-724 автообновление отчётов" for the full
setup, secrets locations and how to roll it back.
