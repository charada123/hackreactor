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

- **Southeast** — FL, GA, AL, SC, NC — split into three territories:
  1. FL  2. AL & GA  3. N/S Carolina
- **Central** — TN, TX, LA, MS, OK, AR, IL, IN, KY, OH, MI, WI — split into six
  territories:
  1. S. Texas (Austin and south)  2. N. Texas + OK  3. LA, MS & AR
  4. TN & KY  5. OH & MI  6. IL, IN & WI
- **Northeast** — ME, NH, VT, MA, RI, CT, NY, NJ, PA, DE, MD, VA, WV (+ DC) —
  three territories:
  1. New England  2. PA, MD, DE & the Virginias  3. NY & NJ
- **Great Plains** — UT, CO, NE, WY, MT, SD, ND, MN, IA, KS, MO — three
  territories:
  1. KS & MO  2. CO, UT, WY & MT  3. NE, Dakotas, MN & IA
- **West** — AK, WA, OR, ID, CA, NV, AZ, NM, HI — five territories:
  1. SoCal (San Diego–Long Beach) + Vegas + HI  2. LA to San Luis Obispo
  3. N. California + the rest of NV  4. AZ & NM  5. AK, WA, OR & ID

Three states are cut mid-state: Texas at Austin's parallel, California at Long
Beach and again at San Luis Obispo, and Nevada just north of Las Vegas (close to
the Clark County line).

A region can be broken into sub-territories (`subs` in `src/build-future.mjs`,
which must partition the region or the build fails). A territory can also take
part of a state: `partial` clips the state at a parallel (Texas is cut along
Austin's latitude), and the build checks the clipped area to catch the
ring-winding mistake that would otherwise render the piece inside-out. They render as tonal bands
with dashed dividers, numbered on the card and — once you click into the region
— on the map.

Named candidates under consideration for a region (currently Rich Cialella,
Regional Business Director, for the Northeast) show on the region's card in
the sidebar.

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
