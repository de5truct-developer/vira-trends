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
pattern). Intended dev subdomain: `trends.tryvira.app` (Dokploy app, separate from `vira-dev`).
