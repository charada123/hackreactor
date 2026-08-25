import { readFileSync, writeFileSync } from 'fs';
const d = JSON.parse(readFileSync(new URL('./futuredata.json', import.meta.url)));

const ABBR = {
  Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',Colorado:'CO',Connecticut:'CT',
  Delaware:'DE',Florida:'FL',Georgia:'GA',Hawaii:'HI',Idaho:'ID',Illinois:'IL',Indiana:'IN',Iowa:'IA',
  Kansas:'KS',Kentucky:'KY',Louisiana:'LA',Maine:'ME',Maryland:'MD',Massachusetts:'MA',Michigan:'MI',
  Minnesota:'MN',Mississippi:'MS',Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV',
  'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
  'North Dakota':'ND',Ohio:'OH',Oklahoma:'OK',Oregon:'OR',Pennsylvania:'PA','Rhode Island':'RI',
  'South Carolina':'SC','South Dakota':'SD',Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',
  Virginia:'VA',Washington:'WA','West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY',
  'District of Columbia':'DC',
};

// Every territory gets its own colour, assigned so that no two territories that
// touch look alike. Golden-angle hues alone aren't enough — Oklahoma and Kansas
// sit far apart in the list but share a border — so colours are chosen greedily
// against the real adjacency graph, maximising the distance to each already
// coloured neighbour.
function hsl(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// 18 well-spread candidates: 9 hues in two lightness tiers.
const PALETTE = [];
for (let tier = 0; tier < 2; tier++) {
  for (let i = 0; i < 9; i++) {
    const h = (i * 40 + tier * 20 + 8) % 360;
    PALETTE.push({ h, l: tier ? 0.42 : 0.58, hex: hsl(h, tier ? 0.62 : 0.70, tier ? 0.42 : 0.58) });
  }
}
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const swatchGap = (a, b) => hueGap(a.h, b.h) + Math.abs(a.l - b.l) * 120;

function colourTerritories(ids, adjacency) {
  const nbrs = new Map(ids.map(id => [id, []]));
  for (const [a, b] of adjacency) {
    if (nbrs.has(a) && nbrs.has(b)) { nbrs.get(a).push(b); nbrs.get(b).push(a); }
  }
  // Most-constrained territories choose first.
  const order = [...ids].sort((a, b) => nbrs.get(b).length - nbrs.get(a).length);
  const chosen = new Map();
  const used = new Array(PALETTE.length).fill(0);
  for (const id of order) {
    const taken = nbrs.get(id).map(n => chosen.get(n)).filter(Boolean);
    let best = null, bestScore = -Infinity;
    PALETTE.forEach((cand, i) => {
      const gap = taken.length ? Math.min(...taken.map(t => swatchGap(cand, t))) : 999;
      const score = gap - used[i] * 10;
      if (score > bestScore) { bestScore = score; best = i; }
    });
    used[best]++;
    chosen.set(id, PALETTE[best]);
  }
  return chosen;
}

// The region name is now the main thing carrying region identity, since the
// fills belong to individual territories. Give each one its region's colour,
// darkened for the light theme and lightened for the dark one so it stays
// legible against the panel-coloured halo.
const mix = (hex, to, amt) => {
  const c = i => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const t = i => parseInt(to.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map(i =>
    Math.round(c(i) + (t(i) - c(i)) * amt).toString(16).padStart(2, '0')).join('');
};
const labelColors = r => ({ light: mix(r.color, '#000000', 0.28), dark: mix(r.color, '#ffffff', 0.34) });

const TERRITORY_IDS = d.regions.flatMap(r => r.subs.map((_, i) => `${r.key}:${i}`));
const TERRITORY_COLOR = colourTerritories(TERRITORY_IDS, d.adjacency || []);

// A territory's chips: whole states, plus split states marked (S)/(N).
const chipsFor = t => [
  ...t.states.map(st => ABBR[st] || st),
  ...(t.partial || []).map(q => q.chip || ABBR[q.state] || q.state),
];

const regions = d.regions.map(r => ({
  ...r,
  labelColor: labelColors(r),
  subs: r.subs.map((t, i) => ({ ...t, color: TERRITORY_COLOR.get(`${r.key}:${i}`).hex })),
  abbrs: r.states.map(s => ABBR[s] || s).concat(r.hasDC ? ['DC'] : []),
  countLabel: `${r.states.length} states${r.hasDC ? ' + DC' : ''}`,
}));
const stateTotal = regions.reduce((n, r) => n + r.states.length, 0);
const territoryTotal = regions.reduce((n, r) => n + (r.subs.length || 1), 0);

// ---- Name labels ----
// 15 names on one map collide if they all sit in the same place, so each label
// is offered a ring of candidate slots and takes the first that clears the
// labels and markers already placed. Widths are estimated from the glyphs
// because there's no text engine at build time.
// Tuned for the 14px/700 label face used on the map.
const CHAR_W = { default: 7.7, narrow: 4.1, wide: 12.0, upper: 9.4 };
const textWidth = str => [...str].reduce((w, ch) => w +
  ('iljtfr.,\'!|:;'.includes(ch) ? CHAR_W.narrow
    : 'mwMW'.includes(ch) ? CHAR_W.wide
    : ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? CHAR_W.upper
    : CHAR_W.default), 0);

const LABEL_H = 15;
const PIN_R = 9;          // marker half-size to steer clear of
const SLOTS = [
  { dx: 12, dy: 0, anchor: 'start' },
  { dx: -12, dy: 0, anchor: 'end' },
  { dx: 0, dy: -15, anchor: 'middle' },
  { dx: 0, dy: 17, anchor: 'middle' },
  { dx: 11, dy: -14, anchor: 'start' },
  { dx: -11, dy: -14, anchor: 'end' },
  { dx: 11, dy: 16, anchor: 'start' },
  { dx: -11, dy: 16, anchor: 'end' },
  { dx: 0, dy: -30, anchor: 'middle' },
  { dx: 0, dy: 32, anchor: 'middle' },
  { dx: 15, dy: -28, anchor: 'start' },
  { dx: -15, dy: -28, anchor: 'end' },
  { dx: 15, dy: 30, anchor: 'start' },
  { dx: -15, dy: 30, anchor: 'end' },
  { dx: 0, dy: -45, anchor: 'middle' },
  { dx: 0, dy: 47, anchor: 'middle' },
];
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w &&
                           a.y < b.y + b.h && b.y < a.y + a.h;

// The region names are drawn on the map too, so they're obstacles as much as
// the markers are — "Central" and "Tammy Graham" otherwise land on top of
// each other.
const REGION_LABEL_PX = 17;
function regionLabelBoxes(regions) {
  const k = REGION_LABEL_PX / 14;   // CHAR_W is calibrated at 14px
  const boxes = regions.map(r => {
    const w = textWidth(r.name) * k;
    return { x: r.x - w / 2 - 3, y: r.y - (REGION_LABEL_PX + 4) / 2, w: w + 6, h: REGION_LABEL_PX + 4 };
  });
  // The territory numerals only appear once a region is zoomed, but the map
  // scales uniformly — clearing them at 1x clears them at every zoom level.
  for (const r of regions) {
    for (const t of r.subs || []) {
      boxes.push({ x: t.x - 9, y: t.y - 11, w: 18, h: 22 });
    }
  }
  return boxes;
}

function placeLabels(people, obstacles = []) {
  // Markers are obstacles for every label, including their own.
  const blocked = people
    .map(p => ({ x: p.x - PIN_R, y: p.y - PIN_R, w: PIN_R * 2, h: PIN_R * 2 }))
    .concat(obstacles);
  const placed = [];
  // Crowded pins have the fewest workable slots, so they choose first.
  const order = people.map((p, i) => ({ p, i,
    near: people.filter(q => Math.hypot(q.x - p.x, q.y - p.y) < 60).length }))
    .sort((a, b) => b.near - a.near || a.p.y - b.p.y);

  const out = new Array(people.length);
  for (const { p, i } of order) {
    const w = textWidth(p.name);
    let chosen = null;
    for (const slot of SLOTS) {
      const x = slot.anchor === 'start' ? p.x + slot.dx
        : slot.anchor === 'end' ? p.x + slot.dx - w
        : p.x - w / 2;
      const box = { x, y: p.y + slot.dy - LABEL_H / 2, w, h: LABEL_H };
      if (box.x < 2 || box.x + box.w > W - 2 || box.y < 2 || box.y + box.h > H - 2) continue;
      if (blocked.some(b => overlaps(box, b))) continue;
      if (placed.some(b => overlaps(box, b))) continue;
      chosen = { ...slot, box };
      break;
    }
    // Nothing clear: fall back to the first slot rather than drop the name.
    if (!chosen) {
      const slot = SLOTS[0];
      chosen = { ...slot, box: { x: p.x + slot.dx, y: p.y + slot.dy - LABEL_H / 2, w, h: LABEL_H } };
    }
    placed.push(chosen.box);
    out[i] = { dx: chosen.dx, dy: chosen.dy, anchor: chosen.anchor };
  }
  return out;
}

const W = d.W, H = d.H;
const LABELS = placeLabels(d.reps, regionLabelBoxes(d.regions));

// Role marker: shape first, colour second.
// The roster keeps finer roles; the map shows three. Trainers and the partner
// team sell through the indirect channel, so they carry the indirect marker
// (the team keeps a count badge, since it stands for four people).
const DISPLAY_GROUP = { direct: 'direct', field: 'field', trainer: 'field',
                        team: 'field', prospect: 'prospect' };
const GROUPS = [
  { key: 'direct', label: 'Direct rep' },
  { key: 'field', label: 'Indirect rep' },
  { key: 'prospect', label: 'Future consideration' },
];
const MARKER = {
  direct: '<circle class="core" r="6.5"></circle>',
  field: '<rect class="core" x="-6" y="-6" width="12" height="12" rx="2.5"></rect>',
  prospect: '<circle class="core" r="7"></circle>',
};

const html = `<title>Territory Map</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{
    --bg:#e9edf1; --panel:#ffffff; --panel-2:#f4f7f9;
    --ink:#152431; --muted:#5d6d7a; --faint:#8a97a2;
    --line:#dbe3e9; --line-strong:#c7d1d9;
    --land:#e5ebef; --land-line:#c3ccd4;
    --field:#0e7c7b; --trainer:#cf5f38; --team:#6d4a86; --prospect:#2f6f9f; --direct:#c23a86;
    --accent:#0e7c7b;
    --shadow:0 1px 2px rgba(20,40,60,.06),0 8px 24px rgba(20,40,60,.08);
    --radius:14px;
    --fill-op:.30; --fill-op-hi:.62;
    --sans:"Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;
  }
  @media (prefers-color-scheme:dark){
    :root{
      --bg:#0b1219; --panel:#111d27; --panel-2:#0e1922;
      --ink:#e9f1f6; --muted:#93a3b0; --faint:#657481;
      --line:#20303c; --line-strong:#2a3d4a;
      --land:#1a2833; --land-line:#2c404e;
      --field:#2bb9b3; --trainer:#e58256; --team:#a988c4; --prospect:#5b9bd5; --direct:#e274b4;
      --accent:#2bb9b3;
      --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.35);
      --fill-op:.34; --fill-op-hi:.7;
    }
  }
  :root[data-theme="light"]{
    --bg:#e9edf1; --panel:#ffffff; --panel-2:#f4f7f9;
    --ink:#152431; --muted:#5d6d7a; --faint:#8a97a2;
    --line:#dbe3e9; --line-strong:#c7d1d9;
    --land:#e5ebef; --land-line:#c3ccd4;
    --field:#0e7c7b; --trainer:#cf5f38; --team:#6d4a86; --prospect:#2f6f9f; --direct:#c23a86;
    --accent:#0e7c7b;
    --shadow:0 1px 2px rgba(20,40,60,.06),0 8px 24px rgba(20,40,60,.08);
    --fill-op:.30; --fill-op-hi:.62;
  }
  :root[data-theme="dark"]{
    --bg:#0b1219; --panel:#111d27; --panel-2:#0e1922;
    --ink:#e9f1f6; --muted:#93a3b0; --faint:#657481;
    --line:#20303c; --line-strong:#2a3d4a;
    --land:#1a2833; --land-line:#2c404e;
    --field:#2bb9b3; --trainer:#e58256; --team:#a988c4; --prospect:#5b9bd5; --direct:#e274b4;
    --accent:#2bb9b3;
    --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.35);
    --fill-op:.34; --fill-op-hi:.7;
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
    -webkit-font-smoothing:antialiased;line-height:1.5;}
  .app{display:flex;flex-direction:column;min-height:100%;max-width:1280px;margin:0 auto;padding:20px;gap:16px;}

  header.head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;}
  .brand{display:flex;flex-direction:column;gap:4px;}
  .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:700;}
  h1{margin:0;font-size:clamp(22px,3vw,30px);letter-spacing:-.02em;font-weight:750;text-wrap:balance;}
  .sub{color:var(--muted);font-size:13.5px;}
  .head-meta{display:flex;gap:22px;align-items:center;}
  .stat{display:flex;flex-direction:column;line-height:1.1;}
  .stat b{font-size:20px;font-variant-numeric:tabular-nums;letter-spacing:-.01em;}
  .stat span{font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.08em;margin-top:3px;}

  .navrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
  .navlink{font-size:13px;font-weight:650;text-decoration:none;color:var(--muted);background:var(--panel-2);
    border:1px solid var(--line);border-radius:10px;padding:8px 14px;transition:.15s;}
  .navlink:hover{color:var(--ink);border-color:var(--accent);}
  .navlink.here{background:var(--panel);color:var(--ink);box-shadow:var(--shadow);border-color:var(--line-strong);}

  .layout{display:grid;grid-template-columns:340px 1fr;gap:16px;align-items:start;}
  @media (max-width:880px){.layout{grid-template-columns:1fr;}}

  .panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);}

  /* Region list */
  .roster{display:flex;flex-direction:column;overflow:hidden;}
  .search{padding:14px 14px 12px;border-bottom:1px solid var(--line);}
  .search input{width:100%;padding:9px 12px;border:1px solid var(--line-strong);border-radius:10px;
    background:var(--panel-2);color:var(--ink);font:inherit;font-size:13.5px;outline:none;}
  .search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent);}
  .list{list-style:none;margin:0;padding:8px;overflow:auto;flex:1;min-height:140px;}
  .rcard{padding:11px 12px;border-radius:11px;cursor:pointer;border:1px solid transparent;
    transition:background .14s,border-color .14s;}
  .rcard:hover{background:var(--panel-2);}
  .rcard.active{background:color-mix(in srgb,var(--accent) 10%,var(--panel));
    border-color:color-mix(in srgb,var(--accent) 40%,transparent);}
  .rcard.hidden{display:none;}
  .rtop{display:flex;align-items:center;gap:9px;}
  .swatch{width:11px;height:11px;border-radius:3px;flex:none;}
  .rname{font-weight:700;font-size:14.5px;letter-spacing:-.01em;color:var(--c,var(--ink));}
  @media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) .rname{color:var(--cd,var(--ink));} }
  :root[data-theme="dark"] .rname{color:var(--cd,var(--ink));}
  :root[data-theme="light"] .rname{color:var(--c,var(--ink));}
  .rcount{margin-left:auto;font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.07em;
    font-variant-numeric:tabular-nums;}
  .abbrs{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;}
  .ab{font-size:12px;font-weight:650;color:var(--muted);background:var(--panel-2);
    border:1px solid var(--line);border-radius:6px;padding:2.5px 7px;letter-spacing:.02em;}
  .rpeople{margin-top:8px;font-size:11.5px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 8px;}
  .rpeople .pn{display:inline-flex;align-items:center;gap:5px;}
  .rpeople .pd{width:8px;height:8px;flex:none;}
  .rpeople .pd.direct{background:var(--direct);border-radius:50%}
  .rpeople .pd.field{background:var(--field);border-radius:2px}
  .rpeople .pd.prospect{background:transparent;border:1.5px dashed var(--prospect);border-radius:50%}
  .rnone{margin-top:8px;font-size:11.5px;color:var(--faint);font-style:italic;}
  .subs{margin-top:8px;display:flex;flex-direction:column;gap:6px;}
  .sub{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
  .snumb{width:19px;height:19px;border-radius:6px;flex:none;display:inline-flex;align-items:center;
    justify-content:center;font-size:11.5px;font-weight:750;color:#fff;}
  .sname{font-size:14px;font-weight:700;}
  .sub .abbrs{margin-top:0;}
  .rcand{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line-strong);display:flex;
    align-items:baseline;gap:7px;flex-wrap:wrap;font-size:11.5px;}
  .rcand .lbl{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--accent);}
  .rcand .cn{font-weight:650;color:var(--ink);}
  .rcand .cr{color:var(--muted);}
  .empty{padding:24px 14px;color:var(--faint);font-size:13px;text-align:center;}

  /* Map */
  .mapwrap{position:relative;overflow:hidden;border-radius:var(--radius);}
  .mapwrap > svg{display:block;width:100%;height:auto;background:linear-gradient(180deg,var(--panel),var(--panel-2));}
  .mapctl{position:absolute;top:12px;right:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;}
  .mapctl button{font:inherit;font-size:12px;font-weight:600;color:var(--muted);background:var(--panel);
    border:1px solid var(--line-strong);border-radius:9px;padding:6px 11px;cursor:pointer;box-shadow:var(--shadow);}
  .mapctl button:hover{color:var(--ink);border-color:var(--accent);}
  .mapctl button[aria-pressed="false"]{opacity:.5;}
  #vp{transition:transform .55s cubic-bezier(.22,.61,.36,1);transform-origin:0 0;}
  @media (prefers-reduced-motion:reduce){#vp{transition:none}}
  path.state{fill:var(--land);stroke:none;}
  path.borders{fill:none;stroke:var(--land-line);stroke-width:.7;stroke-linejoin:round;vector-effect:non-scaling-stroke;}
  path.nation{fill:none;stroke:var(--line-strong);stroke-width:1;vector-effect:non-scaling-stroke;}

  .rfill{fill-opacity:var(--fill-op);stroke:none;cursor:pointer;transition:fill-opacity .18s;}
  .rfill.hover,.rfill.active{fill-opacity:var(--fill-op-hi);}
  .rfill.dim{fill-opacity:.07;}
  .sborder{fill:none;stroke:var(--ink);stroke-opacity:.4;stroke-width:1.1;stroke-dasharray:4 3;
    vector-effect:non-scaling-stroke;stroke-linejoin:round;pointer-events:none;}
  .snum{fill:var(--ink);font:750 17px var(--sans);text-anchor:middle;dominant-baseline:central;pointer-events:none;
    paint-order:stroke;stroke:var(--panel);stroke-width:4.6px;stroke-linejoin:round;opacity:0;transition:opacity .25s;}
  .snum.show{opacity:.9;}
  .rborder{fill:none;stroke:var(--ink);stroke-opacity:.62;stroke-width:2.4;vector-effect:non-scaling-stroke;
    stroke-linejoin:round;pointer-events:none;}
  .rlabel{fill:var(--c,var(--ink));font:750 17px var(--sans);text-anchor:middle;dominant-baseline:central;pointer-events:none;
    paint-order:stroke;stroke:var(--panel);stroke-width:4.6px;stroke-linejoin:round;letter-spacing:.02em;}
  .rlabel.dim{opacity:.3;}
  .rlabel.hide{opacity:0;}
  @media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) .rlabel{fill:var(--cd,var(--ink));} }
  :root[data-theme="dark"] .rlabel{fill:var(--cd,var(--ink));}
  :root[data-theme="light"] .rlabel{fill:var(--c,var(--ink));}

  /* Each role gets its own shape as well as its own colour, so the map still
     reads when printed or seen by someone who can't separate the hues. */
  .pin{cursor:pointer;}
  .pin .core{stroke:var(--panel);stroke-width:1.8;}
  .pin.field .core{fill:var(--field)} .pin.direct .core{fill:var(--direct)}
  .pin.prospect .core{fill:var(--panel);stroke:var(--prospect);stroke-width:2.4;stroke-dasharray:3.4 2.6;}
  .pin .badge{fill:var(--panel);stroke:var(--field);stroke-width:1.2;}
  .pin .badgetx{font:700 8px var(--sans);fill:var(--ink);text-anchor:middle;dominant-baseline:central;}
  .pin.dim{opacity:.15;}
  .pin.off{display:none;}
  .plabel{font:700 14px var(--sans);fill:var(--ink);pointer-events:none;
    paint-order:stroke;stroke:var(--panel);stroke-width:4.2px;stroke-linejoin:round;
    letter-spacing:-.01em;dominant-baseline:central;}
  #pins.nonames .plabel{display:none;}
  .pin:hover .core{stroke:var(--ink);}

  .maplegend{display:flex;flex-wrap:wrap;gap:6px;padding:11px 12px;border-top:1px solid var(--line);}
  .lg{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:20px;
    border:1px solid var(--line-strong);background:var(--panel-2);font:inherit;font-size:12px;
    color:var(--muted);cursor:pointer;user-select:none;transition:.15s;}
  .lg:hover{border-color:var(--accent);color:var(--ink);}
  .lg[aria-pressed="false"]{opacity:.42;}
  .lg svg{display:block;flex:none;overflow:visible;}
  .lg .pin{cursor:inherit;}
  .lg .n{font-variant-numeric:tabular-nums;color:var(--faint);}

  .tip{position:absolute;pointer-events:none;opacity:0;transform:translate(-50%,-118%);transition:opacity .12s;
    background:var(--ink);color:var(--panel);padding:8px 11px;border-radius:9px;font-size:12px;max-width:240px;
    box-shadow:0 8px 24px rgba(0,0,0,.28);z-index:5;line-height:1.35;}
  .tip .tn{font-weight:700;font-size:12.5px;}
  .tip .tr{opacity:.8;font-size:11px;margin-top:2px;}
  .tip:after{content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);
    border:6px solid transparent;border-top-color:var(--ink);}

  footer{color:var(--faint);font-size:12px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:0 2px;}
  .theme{cursor:pointer;background:none;border:1px solid var(--line-strong);color:var(--muted);
    border-radius:8px;padding:4px 10px;font:inherit;font-size:12px;}
  .theme:hover{color:var(--ink);border-color:var(--accent);}
</style>

<div class="app">
  <header class="head">
    <div class="brand">
      <span class="eyebrow">Territory planning · Draft</span>
      <h1>Territory Map</h1>
      <span class="sub">A proposed five-region split of the country with the sales team plotted on it. Click a region to zoom in and see its territories.</span>
    </div>
    <div class="head-meta">
      <div class="stat"><b>${regions.length}</b><span>Regions</span></div>
      <div class="stat"><b>${stateTotal}</b><span>States</span></div>
      <div class="stat"><b>${territoryTotal}</b><span>Territories</span></div>
      <div class="stat"><b>${d.reps.length}</b><span>People</span></div>
    </div>
  </header>

  <nav class="navrow" aria-label="Map views">
    <a class="navlink" href="index.html">Team map</a>
    <a class="navlink here" href="future.html" aria-current="page">Territory map</a>
  </nav>

  <div class="layout">
    <aside class="panel roster">
      <div class="search"><input id="q" type="search" placeholder="Search region or state…" aria-label="Search regions and states"></div>
      <ul class="list" id="list"></ul>
    </aside>

    <section class="panel mapwrap" id="mapwrap">
      <div class="mapctl">
        <button id="labelToggle" aria-pressed="true">Labels</button>
        <button id="pinToggle" aria-pressed="true">People</button>
        <button id="nameToggle" aria-pressed="true">Names</button>
        <button id="reset">Reset view</button>
      </div>
      <svg viewBox="0 0 ${d.W} ${d.H}" role="img" aria-label="United States map divided into five proposed sales regions">
        <g id="vp">
          <path class="state" d="${d.statePaths}"></path>
          <g id="regions">
            ${regions.map(r => r.subs.length
              ? r.subs.map(t => `<path class="rfill" data-key="${r.key}" d="${t.d}" fill="${t.color}"></path>`).join('')
              : `<path class="rfill" data-key="${r.key}" d="${r.d}" fill="${r.color}"></path>`).join('')}
          </g>
          <path class="borders" d="${d.borderPath}"></path>
          <path class="sborder" d="${d.subBorderPath}"></path>
          <path class="rborder" d="${d.regionBorderPath}"></path>
          <path class="nation" d="${d.nationPath}"></path>
          <g id="pins"></g>
          <g id="rlabels">
            ${regions.map(r => `<text class="rlabel" data-key="${r.key}" x="${r.x}" y="${r.y}" ` +
              `style="--c:${r.labelColor.light};--cd:${r.labelColor.dark}">${r.name}</text>`).join('')}
            ${regions.flatMap(r => r.subs.map((t, i) =>
              `<text class="snum" data-key="${r.key}" x="${t.x}" y="${t.y}">${i + 1}</text>`)).join('')}
          </g>
        </g>
      </svg>
      <div class="maplegend" id="legend">
        ${GROUPS.map(g => {
          const n = d.reps.filter(r => DISPLAY_GROUP[r.group] === g.key).length;
          return `<button class="lg ${g.key}" data-g="${g.key}" aria-pressed="true">` +
            `<svg width="17" height="17" viewBox="-9 -9 18 18" aria-hidden="true">` +
            `<g class="pin ${g.key}">${MARKER[g.key]}</g></svg>` +
            `${g.label}<span class="n">${n}</span></button>`;
        }).join('')}
      </div>
      <div class="tip" id="tip"></div>
    </section>
  </div>

  <footer>
    <span>Draft regional model for planning, with today's team plotted on it. Per-rep assignments as they stand now are on the <a href="index.html" style="color:var(--accent)">current territory map</a>.</span>
    <button class="theme" id="themeBtn">Toggle theme</button>
  </footer>
</div>

<script>
const ABBR = ${JSON.stringify(ABBR)};
const MARKER = ${JSON.stringify(MARKER)};
const GROUP_LABEL = ${JSON.stringify(Object.fromEntries(GROUPS.map(g => [g.key, g.label])))};
const REGIONS = ${JSON.stringify(regions.map(r => ({ key: r.key, name: r.name, color: r.color, labelColor: r.labelColor, abbrs: r.abbrs, countLabel: r.countLabel, states: r.states, candidates: r.candidates, subs: r.subs.map(t => ({ name: t.name, states: t.states, chips: chipsFor(t), color: t.color })) })))};
const PEOPLE = ${JSON.stringify(d.reps.map((r, i) => ({ name: r.name, city: r.city, role: r.role, group: DISPLAY_GROUP[r.group], state: r.state, region: r.region, x: r.x, y: r.y,
  count: r.group === 'team' ? 4 : 1, lab: LABELS[i] })))};
const W=${d.W}, H=${d.H};

const listEl = document.getElementById('list');
const pinsG = document.getElementById('pins');
const wrap = document.getElementById('mapwrap');
const vp = document.getElementById('vp');
const tip = document.getElementById('tip');
let active = null;

const peopleIn = key => PEOPLE.filter(p => p.region === key);

// A region no longer has one colour, so its swatch shows the territories in it.
function swatchStyle(r){
  if(!r.subs.length) return \`background:\${r.color}\`;
  const n = r.subs.length;
  const stops = r.subs.map((t,i)=>\`\${t.color} \${(i/n*100).toFixed(1)}% \${((i+1)/n*100).toFixed(1)}%\`);
  return \`background:linear-gradient(135deg,\${stops.join(',')})\`;
}

// --- region cards ---
REGIONS.forEach(r => {
  const who = peopleIn(r.key);
  const li = document.createElement('li');
  li.className = 'rcard'; li.dataset.key = r.key; li.tabIndex = 0;
  li.innerHTML =
    \`<div class="rtop"><span class="swatch" style="\${swatchStyle(r)}"></span>
       <span class="rname" style="--c:\${r.labelColor.light};--cd:\${r.labelColor.dark}">\${r.name}</span>
       <span class="rcount">\${r.countLabel}</span></div>
     \${r.subs.length
       ? \`<div class="subs">\${r.subs.map((t,i)=>\`<div class="sub">
            <span class="snumb" style="background:\${t.color}">\${i+1}</span>
            <span class="sname">\${t.name}</span>
            <span class="abbrs">\${t.chips.map(a=>\`<span class="ab">\${a}</span>\`).join('')}</span>
          </div>\`).join('')}</div>\`
       : \`<div class="abbrs">\${r.abbrs.map(a=>\`<span class="ab">\${a}</span>\`).join('')}</div>\`}\` +
    (who.length
      ? \`<div class="rpeople">\${who.map(p=>\`<span class="pn"><span class="pd \${p.group}"></span>\${p.name}</span>\`).join('')}</div>\`
      : \`<div class="rnone">No one on the map here yet.</div>\`) +
    r.candidates.map(c=>\`<div class="rcand"><span class="lbl">Under consideration</span>
       <span class="cn">\${c.name}</span><span class="cr">\${c.role}</span></div>\`).join('');
  li.addEventListener('click', () => select(r.key));
  li.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();select(r.key);} });
  listEl.appendChild(li);
});

// --- people on the map ---
PEOPLE.forEach(p => {
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','pin '+p.group);
  g.setAttribute('transform',\`translate(\${p.x} \${p.y})\`);
  g.dataset.region = p.region;
  g.dataset.group = p.group;
  g.innerHTML = MARKER[p.group] +
    (p.count > 1 ? \`<circle class="badge" cx="6.5" cy="-6.5" r="5.6"></circle>\` +
                   \`<text class="badgetx" x="6.5" y="-6.5">\${p.count}</text>\` : '') +
    \`<text class="plabel" x="\${p.lab.dx}" y="\${p.lab.dy}" text-anchor="\${p.lab.anchor}">\${p.name}</text>\`;
  g.addEventListener('mouseenter', e => showPersonTip(p, e));
  g.addEventListener('mousemove', e => showPersonTip(p, e));
  g.addEventListener('mouseleave', hideTip);
  pinsG.appendChild(g);
});

function showPersonTip(p, evt){
  const wr = wrap.getBoundingClientRect();
  tip.style.left = (evt.clientX - wr.left) + 'px';
  tip.style.top = (evt.clientY - wr.top - 6) + 'px';
  tip.innerHTML = \`<div class="tn">\${p.name}</div><div>\${p.city}</div>\` +
    \`<div class="tr">\${GROUP_LABEL[p.group]} · \${p.role}</div>\`;
  tip.style.opacity = 1;
}

// --- tooltip ---
function showTip(key, evt){
  const r = REGIONS.find(x=>x.key===key); if(!r) return;
  const who = peopleIn(key);
  const wr = wrap.getBoundingClientRect();
  tip.style.left = (evt.clientX - wr.left) + 'px';
  tip.style.top = (evt.clientY - wr.top - 6) + 'px';
  tip.innerHTML = \`<div class="tn">\${r.name}</div><div>\${r.countLabel} · \${r.abbrs.join(' ')}</div>\` +
    \`<div class="tr">\${who.length ? who.length + ' on the map today' : 'No coverage on the map today'}</div>\` +
    (r.subs.length ? \`<div class="tr">\${r.subs.length} territories: \${r.subs.map(t=>t.name).join(' · ')}</div>\` : '') +
    r.candidates.map(c=>\`<div class="tr">Under consideration: \${c.name} · \${c.role}</div>\`).join('');
  tip.style.opacity = 1;
}
function hideTip(){ tip.style.opacity = 0; }

// --- select / zoom ---
function select(key){
  active = active === key ? null : key;
  document.querySelectorAll('.rcard').forEach(c=>c.classList.toggle('active', c.dataset.key===active));
  document.querySelectorAll('.rfill').forEach(p=>{
    p.classList.toggle('active', p.dataset.key===active);
    p.classList.toggle('dim', active!==null && p.dataset.key!==active);
  });
  const subdivided = new Set(REGIONS.filter(r=>r.subs.length).map(r=>r.key));
  document.querySelectorAll('.rlabel').forEach(t=>{
    t.classList.toggle('dim', active!==null && t.dataset.key!==active);
    t.classList.toggle('hide', t.dataset.key===active && subdivided.has(active));
  });
  document.querySelectorAll('.snum').forEach(t=>t.classList.toggle('show', t.dataset.key===active));
  document.querySelectorAll('.pin').forEach(g=>g.classList.toggle('dim', active!==null && g.dataset.region!==active));
  if(active === null){ resetView(); return; }
  const boxes = [...fillsFor(active)].map(el=>el.getBBox());
  const x0=Math.min(...boxes.map(b=>b.x)), y0=Math.min(...boxes.map(b=>b.y));
  const x1=Math.max(...boxes.map(b=>b.x+b.width)), y1=Math.max(...boxes.map(b=>b.y+b.height));
  const b = {x:x0, y:y0, width:x1-x0, height:y1-y0};
  const pad = 24;
  const s = Math.min(6, Math.max(1, Math.min(W/(b.width+pad*2), H/(b.height+pad*2))));
  const tx = W/2 - (b.x + b.width/2)*s, ty = H/2 - (b.y + b.height/2)*s;
  vp.style.transform = \`translate(\${tx}px,\${ty}px) scale(\${s})\`;
  const card = listEl.querySelector(\`.rcard[data-key="\${active}"]\`);
  if(card) card.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function resetView(){ vp.style.transform = 'translate(0px,0px) scale(1)'; }

const fillsFor = key => document.querySelectorAll(\`.rfill[data-key="\${key}"]\`);
document.querySelectorAll('.rfill').forEach(p=>{
  p.addEventListener('mouseenter', e=>{ fillsFor(p.dataset.key).forEach(x=>x.classList.add('hover')); showTip(p.dataset.key, e); });
  p.addEventListener('mousemove', e=>showTip(p.dataset.key, e));
  p.addEventListener('mouseleave', ()=>{ fillsFor(p.dataset.key).forEach(x=>x.classList.remove('hover')); hideTip(); });
  p.addEventListener('click', e=>{ e.stopPropagation(); select(p.dataset.key); });
});
document.getElementById('reset').addEventListener('click', ()=>{ if(active!==null) select(active); hideTip(); });
wrap.querySelector('svg').addEventListener('click', ()=>{ if(active!==null) select(active); });

// --- search ---
document.getElementById('q').addEventListener('input', e=>{
  const q = (e.target.value||'').toLowerCase().trim();
  let shown = 0;
  REGIONS.forEach(r=>{
    const hay = (r.name+' '+r.states.join(' ')+' '+r.abbrs.join(' ')+' '+
      r.candidates.map(c=>c.name+' '+c.role).join(' ')+' '+
      r.subs.map(t=>t.name+' '+t.states.join(' ')+' '+t.chips.join(' ')).join(' ')).toLowerCase();
    const vis = !q || hay.includes(q);
    listEl.querySelector(\`.rcard[data-key="\${r.key}"]\`).classList.toggle('hidden', !vis);
    if(vis) shown++;
  });
  let em = listEl.querySelector('.empty');
  if(shown===0){ if(!em){ em=document.createElement('li'); em.className='empty'; em.textContent='No region matches.'; listEl.appendChild(em); } }
  else if(em) em.remove();
});

// --- layer toggles ---
function toggler(btnId, targetId){
  let on = true;
  const btn = document.getElementById(btnId);
  btn.addEventListener('click', ()=>{
    on = !on;
    btn.setAttribute('aria-pressed', on);
    document.getElementById(targetId).style.display = on ? '' : 'none';
  });
}
const groupOn = {};
GROUP_LABEL && Object.keys(GROUP_LABEL).forEach(k => groupOn[k] = true);
document.getElementById('legend').addEventListener('click', e => {
  const btn = e.target.closest('.lg'); if(!btn) return;
  const g = btn.dataset.g;
  groupOn[g] = !groupOn[g];
  btn.setAttribute('aria-pressed', groupOn[g]);
  document.querySelectorAll(\`.pin[data-group="\${g}"]\`).forEach(el => el.classList.toggle('off', !groupOn[g]));
});

let namesOn = true;
document.getElementById('nameToggle').addEventListener('click', () => {
  namesOn = !namesOn;
  document.getElementById('nameToggle').setAttribute('aria-pressed', namesOn);
  pinsG.classList.toggle('nonames', !namesOn);
});

toggler('labelToggle','rlabels');
toggler('pinToggle','pins');

// --- theme toggle ---
document.getElementById('themeBtn').addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur==='dark' ? 'light' : (cur==='light' ? 'dark' : (matchMedia('(prefers-color-scheme:dark)').matches ? 'light' : 'dark'));
  document.documentElement.setAttribute('data-theme', next);
});
</script>`;

writeFileSync(new URL('../future.html', import.meta.url), html);
console.log('wrote future.html', html.length, 'bytes');
