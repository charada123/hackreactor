import { readFileSync, writeFileSync } from 'fs';
import { geoAlbersUsa, geoPath, geoContains, geoArea } from 'd3-geo';
import { feature, mesh, merge } from 'topojson-client';
import polygonClipping from 'polygon-clipping';

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

// Austin, TX sits on the parallel that splits the two Texas territories.
const AUSTIN_LAT = 30.2672;

// Everything is normalised to MultiPolygon rings so whole states and clipped
// pieces of a state can be concatenated into one geometry.
const toRings = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
const multi = rings => ({ type: 'MultiPolygon', coordinates: rings });

// Clip a state to one side of a parallel. The cutting edge is densified so it
// projects as the curve a parallel actually is, not a straight chord.
function clipToLat(stateFeature, lat, side) {
  const [[w, sLat], [e, nLat]] = [[-180, -90], [180, 90]];
  const box = side === 'south' ? [sLat, lat] : [lat, nLat];
  const [lo, hi] = box;
  const edge = [];
  for (let x = w; x <= e; x += 0.05) edge.push([+x.toFixed(3), lat]);
  const rect = side === 'south'
    ? [[[w, lo], ...edge, [e, lo], [w, lo]]]
    : [[[w, hi], [e, hi], ...edge.slice().reverse(), [w, hi]]];
  const out = polygonClipping.intersection(toRings(stateFeature.geometry), rect);
  if (!out.length) throw new Error(`clip produced nothing for ${stateFeature.properties.name}`);
  // polygon-clipping winds rings the opposite way from what d3-geo's spherical
  // clipping expects; left as-is, a clipped piece renders as the whole globe
  // minus that piece. Reversing every ring keeps holes consistent too.
  const rings = out.map(poly => poly.map(ring => ring.slice().reverse()));
  const area = geoArea(multi(rings));
  if (!(area > 0) || area >= geoArea(stateFeature)) {
    throw new Error(`clip of ${stateFeature.properties.name} (${side}) has area ${area} — check ring winding`);
  }
  return rings;
}

// The cut itself, as the run(s) of the parallel that fall inside the state.
function cutLine(stateFeature, lat) {
  const lines = [];
  let run = null;
  for (let x = -180; x <= -60; x += 0.02) {
    const p = [+x.toFixed(3), lat];
    if (geoContains(stateFeature, p)) { (run ||= []).push(p); }
    else if (run) { if (run.length > 1) lines.push(run); run = null; }
  }
  if (run && run.length > 1) lines.push(run);
  return lines;
}

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
    subs: [
      // Texas is cut along Austin's parallel: "Austin and south" is territory 1.
      { name: 'S. Texas', states: [], partial: [{ state: 'Texas', side: 'south', lat: AUSTIN_LAT }] },
      { name: 'N. Texas + OK', states: ['Oklahoma'], owns: ['Texas'],
        partial: [{ state: 'Texas', side: 'north', lat: AUSTIN_LAT }] },
      { name: 'LA, MS & AR', states: ['Louisiana', 'Mississippi', 'Arkansas'] },
      { name: 'TN & KY', states: ['Tennessee', 'Kentucky'] },
      { name: 'OH & MI', states: ['Ohio', 'Michigan'] },
      { name: 'IL, IN & WI', states: ['Illinois', 'Indiana', 'Wisconsin'] },
    ],
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
  const listed = [...new Set(r.subs.flatMap(t => [...t.states, ...(t.partial || []).map(q => q.state)]))];
  const missing = r.states.filter(st => !listed.includes(st));
  const extra = listed.filter(st => !r.states.includes(st));
  if (missing.length || extra.length) {
    throw new Error(`${r.name} sub-territories don't partition the region` +
      (missing.length ? ` — missing ${missing.join(', ')}` : '') +
      (extra.length ? ` — not in region: ${extra.join(', ')}` : ''));
  }
  for (const t of r.subs) for (const st of [...t.states, ...(t.owns || [])]) {
    subByStateName[st] = `${r.key}:${t.name}`;
  }
}

const geoms = topo.objects.states.geometries;
const geomsFor = names => geoms.filter(g => names.includes(g.properties.name));
const featureByName = n => states.features.find(f => f.properties.name === n);
const regionOf = g => seen.get(g.properties.name) || null;

const regions = REGIONS.map(r => {
  const merged = merge(topo, geomsFor(r.states));
  const c = path.centroid(merge(topo, geomsFor(r.label || r.states)));
  return {
    key: r.key, name: r.name, color: r.color, candidates: r.candidates || [],
    subs: (r.subs || []).map(t => {
      const rings = [
        ...(t.states.length ? toRings(merge(topo, geomsFor(t.states))) : []),
        ...(t.partial || []).flatMap(q => clipToLat(featureByName(q.state), q.lat, q.side)),
      ];
      const geom = multi(rings);
      const c2 = path.centroid(geom);
      return {
        name: t.name,
        states: t.states,
        partial: (t.partial || []).map(q => ({ state: q.state, side: q.side })),
        d: path(geom),
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
const subMeshPath = path(mesh(topo, topo.objects.states, (a, b) =>
  regionOf(a) === regionOf(b) && subByStateName[a.properties.name] !== subByStateName[b.properties.name]));
const cutPaths = REGIONS.flatMap(r => (r.subs || []).flatMap(t => (t.partial || [])))
  .filter((q, i, all) => all.findIndex(o => o.state === q.state && o.lat === q.lat) === i)
  .map(q => path({ type: 'MultiLineString', coordinates: cutLine(featureByName(q.state), q.lat) }));
const subBorderPath = [subMeshPath, ...cutPaths].filter(Boolean).join(' ');

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
