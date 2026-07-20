# Sales Rep Territory Map

An interactive US map of the field sales team. Single self-contained page —
no external services or map-tile servers, so it loads anywhere.

**Live:** enable GitHub Pages (see below), then visit the published URL.

## What's on it

- Every rep plotted on a projected US map, color-coded by role:
  - **Field reps** (teal) — John Godson · Karla Smyth · Trina Barr · Tammy Graham
  - **Trainer** (ember) — Andrew Lisco, RN
  - **Team** (violet) — Cosmetic Solutions (Reno / Northern CA)
- Click a rep (roster or pin) to zoom to their location
- Search by name, city, or state
- Toggle roles on/off via the legend
- Light / dark themes

## Deploy (GitHub Pages)

1. Push to the branch (already wired to `.github/workflows/deploy.yml`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow publishes `index.html` and prints the public URL in the run summary.

## Rebuilding the map

The map geometry and pin coordinates are baked at build time so the page stays
offline-safe.

```bash
cd src
npm install
node build.mjs   # projects US states + rep lat/lng -> data/mapdata.json
node gen.mjs      # renders ../index.html
```

Edit the `reps` array in `src/build.mjs` to add or move people.
