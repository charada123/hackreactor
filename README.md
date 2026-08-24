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

## Future consideration territories (`future.html`)

A second page proposing a five-region split of the country, for territory
planning. Reachable from the link in the header of the main map.

- **Southeast** — FL, GA, AL, SC, NC
- **Central** — TN, TX, LA, MS, OK, AR, IL, IN, KY, OH, MI, WI
- **Northeast** — ME, NH, VT, MA, RI, CT, NY, NJ, PA, DE, MD, VA, WV (+ DC)
- **Great Plains** — UT, CO, NE, WY, MT, SD, ND, MN, IA, KS, MO
- **West** — AK, WA, OR, ID, CA, NV, AZ, NM, HI

All 50 states land in exactly one region (the build fails if that ever stops
being true). Click a region to zoom in; each region card lists its states and
the people already plotted inside it.

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
node build.mjs         # projects US states + rep lat/lng -> mapdata.json
node gen.mjs           # renders ../index.html

node build-future.mjs  # projects the proposed regions -> futuredata.json
node gen-future.mjs    # renders ../future.html
```

Edit the `reps` array in `src/build.mjs` to add or move people, and the
`REGIONS` array in `src/build-future.mjs` to reshape the proposed regions.
