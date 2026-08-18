import { readFileSync, writeFileSync } from 'fs';
import { geoAlbersUsa, geoPath } from 'd3-geo';
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

// Rep locations. `views` = which tab(s) a person shows in: 'sales', 'trainer', or both.
const reps = [
  { name: 'John Godson', city: 'Tempe, AZ', role: 'Sales Rep', lat: 33.4255, lng: -111.9400, group: 'field', views: ['sales'] },
  { name: 'Karla Smyth', city: 'Boca Raton, FL', role: 'Sales Rep', lat: 26.3683, lng: -80.1289, group: 'field', views: ['sales'] },
  { name: 'Trina Barr', city: 'Boulder, CO', role: 'Sales Rep · Innovaes Labs', lat: 40.0150, lng: -105.2705, group: 'field', views: ['sales'] },
  { name: 'Tammy Graham', city: 'Caseyville, IL', role: 'Sales Rep & Clinical Trainer', lat: 38.6367, lng: -89.9812, group: 'field', views: ['sales', 'trainer'] },
  { name: 'Andrew Liscio, RN', city: 'Neptune, NJ', role: 'Trainer & Sales Rep · The Andrew Aesthetic', lat: 40.2043, lng: -74.0276, group: 'trainer', views: ['sales', 'trainer'] },
  { name: 'Cosmetic Solutions', city: 'Northern CA / Reno', role: 'Lauren Padilla · Omira Sadiq · Candace Clay · Nadia Buchlo', lat: 39.5296, lng: -119.8138, group: 'team', views: ['sales'] },
  // Sales reps
  { name: 'John Dawson', city: 'Lewisville, TX', role: 'Sales Rep', lat: 33.0462, lng: -96.9942, group: 'field', views: ['sales'] },
  { name: 'Taylor Macey', city: 'Los Angeles, CA', role: 'Direct Sales Rep · SoCal', lat: 34.0522, lng: -118.2437, group: 'direct', views: ['sales'] },
  { name: 'Kyle Shapero', city: 'Orlando, FL', role: 'Direct Sales Rep · FL', lat: 28.5383, lng: -81.3792, group: 'direct', views: ['sales'] },
  { name: 'Nick', city: 'Colorado Springs, CO', role: 'Direct Sales Rep · Colorado', lat: 38.8339, lng: -104.8214, group: 'direct', views: ['sales'] },
  // Recruiting targets (prospects) — shown distinctly
  { name: 'Jonathan Butto', city: 'Southern Florida', role: 'Sr. TM · Prospect', lat: 25.7617, lng: -80.1918, group: 'prospect', views: ['sales'] },
  { name: 'Manny Robelo', city: 'Boston, MA', role: 'DSM · Prospect', lat: 42.3601, lng: -71.0589, group: 'prospect', views: ['sales'] },
  { name: 'Seth Cooley', city: 'CO / UT', role: 'DSM · Prospect', lat: 40.7608, lng: -111.8910, group: 'prospect', views: ['sales'] },
  { name: 'Scott Kelly', city: 'Texas', role: 'RBD · Prospect', lat: 29.7604, lng: -95.3698, group: 'prospect', views: ['sales'] },
  { name: 'Zac Replogle', city: 'NorCal', role: 'RBD · Prospect', lat: 37.7749, lng: -122.4194, group: 'prospect', views: ['sales'] },
  // Clinical trainers (Clinical Team Update). Group 'trainer', shown in the Trainers tab.
  { name: 'Anais Cardona', city: 'Houston, TX', role: 'Clinical Trainer · Quantica Medspa', lat: 29.7604, lng: -95.3698, group: 'trainer', views: ['trainer'] },
  { name: 'Carissa McCormack', city: 'Sunnyside, NY', role: 'Clinical Trainer · Northern Center for Plastic Surgery', lat: 40.7433, lng: -73.9196, group: 'trainer', views: ['trainer'] },
  { name: 'Janet Breeding', city: 'Rockford, TN', role: 'Clinical Trainer · The Skin Wellness Center', lat: 35.8309, lng: -83.9207, group: 'trainer', views: ['trainer'] },
  { name: 'Julie Bennet', city: 'Austin, TX', role: 'Clinical Trainer · Skin Bar Austin', lat: 30.2672, lng: -97.7431, group: 'trainer', views: ['trainer'] },
  { name: 'Laura Reynolds', city: 'Anaheim, CA', role: 'Clinical Trainer · Zena Medical', lat: 33.8353, lng: -117.9145, group: 'trainer', views: ['trainer'] },
  { name: 'LeAnna Arietta', city: 'Azusa, CA', role: 'Clinical Trainer · New Image Medspa', lat: 34.1336, lng: -117.9076, group: 'trainer', views: ['trainer'] },
  { name: 'Leigh Anne Barber', city: 'Charlotte, NC', role: 'Clinical Trainer', lat: 35.2271, lng: -80.8431, group: 'trainer', views: ['trainer'] },
  { name: 'Logan Winchester', city: 'New York, NY', role: 'Clinical Trainer · Velour Medspa', lat: 40.7580, lng: -73.9855, group: 'trainer', views: ['trainer'] },
  { name: 'Mika Im', city: 'Irvine, CA', role: 'Clinical Trainer · Ageless MD', lat: 33.6846, lng: -117.8265, group: 'trainer', views: ['trainer'] },
  { name: 'Patti Nunes', city: 'Boston, MA', role: 'Clinical Trainer · Elisiano Dermatology', lat: 42.3426, lng: -71.0552, group: 'trainer', views: ['trainer'] },
  { name: 'Tracey Lewis', city: 'Edmond, OK', role: 'Clinical Trainer · Skin Bar OKC', lat: 35.6528, lng: -97.4781, group: 'trainer', views: ['trainer'] },
];

const placed = reps.map(r => {
  const p = projection([r.lng, r.lat]);
  return { ...r, x: +p[0].toFixed(1), y: +p[1].toFixed(1) };
});

// ---- Sales territories (medical-aesthetics regional coverage, full US) ----
// Each state is assigned to exactly one active sales rep. Direct reps own their
// home state (Kyle=FL, Nick=CO, Taylor=SoCal); co-located indirect reps take an
// adjacent block so every rep gets a contiguous region.
const TERRITORY = {
  'Taylor Macey':      ['California','Nevada','Hawaii'],
  'Cosmetic Solutions':['Oregon','Washington','Idaho','Alaska'],
  'John Godson':       ['Arizona','New Mexico'],
  'Nick':              ['Colorado','Utah','Wyoming'],
  'Trina Barr':        ['Montana','North Dakota','South Dakota','Nebraska'],
  'John Dawson':       ['Texas','Oklahoma','Kansas','Louisiana','Arkansas'],
  'Tammy Graham':      ['Illinois','Missouri','Iowa','Minnesota','Wisconsin','Indiana','Kentucky','Michigan','Ohio'],
  'Kyle Shapero':      ['Florida','Georgia','Alabama','Mississippi','Tennessee','South Carolina'],
  'Karla Smyth':       ['North Carolina','Virginia','West Virginia'],
  'Andrew Liscio, RN': ['New Jersey','New York','Pennsylvania','Connecticut','Rhode Island','Massachusetts',
                        'New Hampshire','Vermont','Maine','Maryland','Delaware','District of Columbia'],
};
// Distinct regional fill color per rep (pins stay colored by role; these are light washes).
const TERR_COLOR = {
  'Taylor Macey':'#17becf','Cosmetic Solutions':'#9467bd','John Godson':'#ff7f0e','Nick':'#d62728',
  'Trina Barr':'#1f77b4','John Dawson':'#2ca02c','Tammy Graham':'#bcbd22','Kyle Shapero':'#e377c2',
  'Karla Smyth':'#8c564b','Andrew Liscio, RN':'#7f7f7f',
};
const ownerByName = {};
for (const [rep, sts] of Object.entries(TERRITORY)) for (const s of sts) ownerByName[s] = rep;
const ownerOf = g => ownerByName[g.properties.name] || null;

const geoms = topo.objects.states.geometries;
const shortName = n => (n === 'Cosmetic Solutions' ? 'Cosmetic Sol.' : n.replace(/,.*$/, '').split(' ').slice(-1)[0]);

// Per-state colored fills
const territories = states.features
  .filter(f => ownerByName[f.properties.name])
  .map(f => ({ owner: ownerByName[f.properties.name], color: TERR_COLOR[ownerByName[f.properties.name]], d: path(f) }));

// Borders between different territories (thicker line)
const terrBorderPath = path(mesh(topo, topo.objects.states, (a, b) => ownerOf(a) !== ownerOf(b)));

// One label per territory at its centroid
const terrLabels = Object.entries(TERRITORY).map(([rep, sts]) => {
  const gs = geoms.filter(g => sts.includes(g.properties.name));
  const c = path.centroid(merge(topo, gs));
  return { name: shortName(rep), color: TERR_COLOR[rep], x: +c[0].toFixed(1), y: +c[1].toFixed(1) };
}).filter(l => Number.isFinite(l.x) && Number.isFinite(l.y));

// Prospect recruiting-target zones (dashed overlay; may overlap current territories)
const PROSPECT_ZONES = {
  'Jonathan Butto': ['Florida'],
  'Manny Robelo':   ['Massachusetts','Connecticut','Rhode Island','New Hampshire','Vermont','Maine'],
  'Seth Cooley':    ['Colorado','Utah'],
  'Scott Kelly':    ['Texas'],
  'Zac Replogle':   ['California'],
};
const prospectZones = Object.entries(PROSPECT_ZONES).map(([name, sts]) => {
  const inSet = g => sts.includes(g.properties.name);
  const d = path(mesh(topo, topo.objects.states, (a, b) => inSet(a) !== inSet(b)));
  const c = path.centroid(merge(topo, geoms.filter(inSet)));
  return { name, d, x: +c[0].toFixed(1), y: +c[1].toFixed(1) };
});

writeFileSync(new URL('./mapdata.json', import.meta.url), JSON.stringify({
  W, H, statePaths, borderPath, nationPath, reps: placed,
  territories, terrBorderPath, terrLabels, prospectZones
}, null, 0));

console.log('states path len', statePaths.length);
console.log('placed:', placed.map(p => `${p.name} -> ${p.x},${p.y}`).join('\n'));
