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
