import { readFileSync, writeFileSync } from 'fs';
import { geoAlbersUsa, geoPath, geoContains } from 'd3-geo';
import { feature, mesh, merge } from 'topojson-client';

const topo = JSON.parse(readFileSync(new URL('./node_modules/us-atlas/states-10m.json', import.meta.url)));
const nation = JSON.parse(readFileSync(new URL('./node_modules/us-atlas/nation-10m.json', import.meta.url)));

const W = 960, H = 600;
const states = feature(topo, topo.objects.states);
const borders = mesh(topo, topo.objects.states, (a, b) => a !== b);
const nationF = feature(nation, nation.objects.nation);

const projection = geoAlbersUsa().fitSize([W, H], states);
const path = geoPath(projection);

const statePaths = states.features.map(f => path(f)).join(' ');
const borderPath = path(borders);
const nationPath = path(nationF);

// ---- Proposed regions for future territory consideration ----
// Five contiguous blocks covering all 50 states. `label` states are the subset
// used to place the region's name (keeps West off Alaska/Hawaii, etc.).
const REGIONS = [
  {
    key: 'southeast', name: 'Southeast', color: '#e0619b',
    states: ['Florida', 'Georgia', 'Alabama', 'South Carolina', 'North Carolina'],
    label: ['Georgia', 'Alabama'],
    subs: [
      { name: 'FL', states: ['Florida'] },
      { name: 'AL & GA', states: ['Alabama', 'Georgia'] },
      { name: 'N/S Carolina', states: ['North Carolina', 'South Carolina'] },
    ],
  },
  {
    key: 'central', name: 'Central', color: '#2f9e44',
    states: ['Tennessee', 'Texas', 'Louisiana', 'Mississippi', 'Oklahoma', 'Arkansas',
             'Illinois', 'Indiana', 'Kentucky', 'Ohio', 'Michigan', 'Wisconsin'],
    label: ['Illinois', 'Kentucky'],
  },
  {
    key: 'northeast', name: 'Northeast', color: '#7a6ff0',
    states: ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut',
             'New York', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'Virginia',
             'West Virginia', 'District of Columbia'],
    label: ['Pennsylvania', 'New York'],
    candidates: [{ name: 'Rich Cialella', role: 'Regional Business Director' }],
  },
  {
    key: 'plains', name: 'Great Plains', color: '#d9932b',
    states: ['Utah', 'Colorado', 'Nebraska', 'Wyoming', 'Montana', 'South Dakota', 'North Dakota',
             'Minnesota', 'Iowa', 'Kansas', 'Missouri'],
    label: ['Nebraska', 'South Dakota', 'Kansas'],
  },
  {
    key: 'west', name: 'West', color: '#17aec9',
    states: ['Alaska', 'Washington', 'Oregon', 'Idaho', 'California', 'Nevada', 'Arizona',
             'New Mexico', 'Hawaii'],
    label: ['Nevada', 'Oregon', 'Idaho'],
  },
];

// Sanity: every state assigned exactly once.
const seen = new Map();
for (const r of REGIONS) for (const s of r.states) {
  if (seen.has(s)) throw new Error(`${s} assigned to both ${seen.get(s)} and ${r.name}`);
  seen.set(s, r.name);
}
// Territories (Puerto Rico, Guam, …) fall outside geoAlbersUsa and never render.
const TERRITORIES = ['American Samoa', 'Guam', 'Commonwealth of the Northern Mariana Islands',
                     'Puerto Rico', 'United States Virgin Islands'];
const unassigned = states.features.map(f => f.properties.name)
  .filter(n => !seen.has(n) && !TERRITORIES.includes(n));
if (unassigned.length) throw new Error('unassigned states: ' + unassigned.join(', '));

// Sub-territories, where a region is broken down further, must partition it.
const subByStateName = {};
for (const r of REGIONS) {
  if (!r.subs) continue;
  const listed = r.subs.flatMap(t => t.states);
  const missing = r.states.filter(st => !listed.includes(st));
  const extra = listed.filter(st => !r.states.includes(st));
  if (missing.length || extra.length) {
    throw new Error(`${r.name} sub-territories don't partition the region` +
      (missing.length ? ` — missing ${missing.join(', ')}` : '') +
      (extra.length ? ` — not in region: ${extra.join(', ')}` : ''));
  }
  for (const t of r.subs) for (const st of t.states) subByStateName[st] = `${r.key}:${t.name}`;
}

const geoms = topo.objects.states.geometries;
const geomsFor = names => geoms.filter(g => names.includes(g.properties.name));
const regionOf = g => seen.get(g.properties.name) || null;

const regions = REGIONS.map(r => {
  const merged = merge(topo, geomsFor(r.states));
  const c = path.centroid(merge(topo, geomsFor(r.label || r.states)));
  return {
    key: r.key, name: r.name, color: r.color, candidates: r.candidates || [],
    subs: (r.subs || []).map(t => {
      const c2 = path.centroid(merge(topo, geomsFor(t.states)));
      return {
        name: t.name, states: t.states,
        d: path({ type: 'Feature', geometry: merge(topo, geomsFor(t.states)) }),
        x: +c2[0].toFixed(1), y: +c2[1].toFixed(1),
      };
    }),
    states: r.states.filter(s => s !== 'District of Columbia'),
    hasDC: r.states.includes('District of Columbia'),
    d: path({ type: 'Feature', geometry: merged }),
    x: +c[0].toFixed(1), y: +c[1].toFixed(1),
  };
});

// Shared boundary between two different regions (drawn heavier than state lines)
const regionBorderPath = path(mesh(topo, topo.objects.states, (a, b) => regionOf(a) !== regionOf(b)));

// Interior lines that split a region into sub-territories (region borders are separate)
const subBorderPath = path(mesh(topo, topo.objects.states, (a, b) =>
  regionOf(a) === regionOf(b) && subByStateName[a.properties.name] !== subByStateName[b.properties.name]));

// ---- Current people, bucketed into the proposed regions ----
// Same roster as build.mjs; the state is derived from the plotted coordinate so
// loose city labels ("NorCal", "CO / UT") still land somewhere sensible.
const reps = [
  { name: 'John Godson', city: 'Tempe, AZ', role: 'Sales Rep', lat: 33.4255, lng: -111.9400, group: 'field' },
  { name: 'Karla Smyth', city: 'Boca Raton, FL', role: 'Sales Rep', lat: 26.3683, lng: -80.1289, group: 'field' },
  { name: 'Trina Barr', city: 'Boulder, CO', role: 'Sales Rep · Innovaes Labs', lat: 40.0150, lng: -105.2705, group: 'field' },
  { name: 'Tammy Graham', city: 'Caseyville, IL', role: 'Sales Rep & Clinical Trainer', lat: 38.6367, lng: -89.9812, group: 'field' },
  { name: 'Andrew Liscio, RN', city: 'Neptune, NJ', role: 'Trainer & Sales Rep', lat: 40.2043, lng: -74.0276, group: 'trainer' },
  { name: 'Cosmetic Solutions', city: 'Northern CA / Reno', role: 'Lauren Padilla · Omira Sadiq · Candace Clay · Nadia Buchlo', lat: 39.5296, lng: -119.8138, group: 'team' },
  { name: 'John Dawson', city: 'Lewisville, TX', role: 'Sales Rep', lat: 33.0462, lng: -96.9942, group: 'field' },
  { name: 'Taylor Macey', city: 'Los Angeles, CA', role: 'Direct Sales Rep · SoCal', lat: 34.0522, lng: -118.2437, group: 'direct' },
  { name: 'Kyle Shapero', city: 'Orlando, FL', role: 'Direct Sales Rep · FL', lat: 28.5383, lng: -81.3792, group: 'direct' },
  { name: 'Nick', city: 'Colorado Springs, CO', role: 'Direct Sales Rep · Colorado', lat: 38.8339, lng: -104.8214, group: 'direct' },
  { name: 'Jonathan Butto', city: 'Southern Florida', role: 'Sr. TM · Prospect', lat: 25.7617, lng: -80.1918, group: 'prospect' },
  { name: 'Manny Robelo', city: 'Boston, MA', role: 'DSM · Prospect', lat: 42.3601, lng: -71.0589, group: 'prospect' },
  { name: 'Seth Cooley', city: 'CO / UT', role: 'DSM · Prospect', lat: 40.7608, lng: -111.8910, group: 'prospect' },
  { name: 'Scott Kelly', city: 'Texas', role: 'RBD · Prospect', lat: 29.7604, lng: -95.3698, group: 'prospect' },
  { name: 'Zac Replogle', city: 'NorCal', role: 'RBD · Prospect', lat: 37.7749, lng: -122.4194, group: 'prospect' },
];

const stateAt = (lng, lat) => {
  const f = states.features.find(s => geoContains(s, [lng, lat]));
  return f ? f.properties.name : null;
};
const regionKeyByStateName = {};
for (const r of REGIONS) for (const s of r.states) regionKeyByStateName[s] = r.key;

const placed = reps.map(r => {
  const p = projection([r.lng, r.lat]);
  const st = stateAt(r.lng, r.lat);
  if (!st) throw new Error(`no state found for ${r.name}`);
  return {
    ...r, state: st, region: regionKeyByStateName[st],
    x: +p[0].toFixed(1), y: +p[1].toFixed(1),
  };
});

writeFileSync(new URL('./futuredata.json', import.meta.url), JSON.stringify({
  W, H, statePaths, borderPath, nationPath, regions, regionBorderPath, subBorderPath, reps: placed,
}, null, 0));

console.log('regions:', regions.map(r => `${r.name} (${r.states.length})${r.candidates.length ? ' candidate: ' + r.candidates.map(c => c.name + ' (' + c.role + ')').join(', ') : ''}${r.subs.length ? ' subs: ' + r.subs.map(t => t.name).join(' | ') : ''}`).join(', '));
console.log('people:', placed.map(p => `${p.name} -> ${p.state} / ${p.region}`).join('\n'));
