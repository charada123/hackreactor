import { readFileSync, writeFileSync } from 'fs';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';

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

// Rep locations
const reps = [
  { name: 'John Godson', city: 'Tempe, AZ', role: 'Sales Rep', lat: 33.4255, lng: -111.9400, group: 'field' },
  { name: 'Karla Smyth', city: 'Boca Raton, FL', role: 'Sales Rep', lat: 26.3683, lng: -80.1289, group: 'field' },
  { name: 'Trina Barr', city: 'Boulder, CO', role: 'Sales Rep · Innovaes Labs', lat: 40.0150, lng: -105.2705, group: 'field' },
  { name: 'Tammy Graham', city: 'Caseyville, IL', role: 'Sales Rep', lat: 38.6367, lng: -89.9812, group: 'field' },
  { name: 'Andrew Lisco, RN', city: 'Neptune, NJ', role: 'Trainer & Sales Rep', lat: 40.2043, lng: -74.0276, group: 'trainer' },
  { name: 'Cosmetic Solutions', city: 'Northern CA / Reno', role: 'Lauren Padilla · Omira Sadiq · Candace Clay · Nadia Buchlo', lat: 39.5296, lng: -119.8138, group: 'team' },
  // Sales reps
  { name: 'John Dawson', city: 'Lewisville, TX', role: 'Sales Rep', lat: 33.0462, lng: -96.9942, group: 'field' },
  { name: 'Taylor Macey', city: 'Los Angeles, CA', role: 'Direct Sales Rep · SoCal', lat: 34.0522, lng: -118.2437, group: 'direct' },
  { name: 'Kyle Shapero', city: 'Orlando, FL', role: 'Direct Sales Rep · FL', lat: 28.5383, lng: -81.3792, group: 'direct' },
  { name: 'Nick', city: 'Colorado Springs, CO', role: 'Direct Sales Rep · Colorado', lat: 38.8339, lng: -104.8214, group: 'direct' },
  // Recruiting targets (prospects) — shown distinctly
  { name: 'Jonathan Butto', city: 'Southern Florida', role: 'Sr. TM · Prospect', lat: 25.7617, lng: -80.1918, group: 'prospect' },
  { name: 'Manny Robelo', city: 'Boston, MA', role: 'DSM · Prospect', lat: 42.3601, lng: -71.0589, group: 'prospect' },
  { name: 'Seth Cooley', city: 'CO / UT', role: 'DSM · Prospect', lat: 40.7608, lng: -111.8910, group: 'prospect' },
  { name: 'Scott Kelly', city: 'Texas', role: 'RBD · Prospect', lat: 29.7604, lng: -95.3698, group: 'prospect' },
  { name: 'Zac Replogle', city: 'NorCal', role: 'RBD · Prospect', lat: 37.7749, lng: -122.4194, group: 'prospect' },
];

const placed = reps.map(r => {
  const p = projection([r.lng, r.lat]);
  return { ...r, x: +p[0].toFixed(1), y: +p[1].toFixed(1) };
});

writeFileSync(new URL('./mapdata.json', import.meta.url), JSON.stringify({
  W, H, statePaths, borderPath, nationPath, reps: placed
}, null, 0));

console.log('states path len', statePaths.length);
console.log('placed:', placed.map(p => `${p.name} -> ${p.x},${p.y}`).join('\n'));
