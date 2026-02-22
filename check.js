import { readFileSync } from 'fs';
import { geoMercator, geoPath } from 'd3-geo';

const topo = JSON.parse(readFileSync('./src/data/maps/india-states.json', 'utf8'));

// D3 geographic projection for India
const projection = geoMercator()
    .scale(1200)
    .center([82.8, 23.5]) // Center slightly adjusted
    .translate([400, 425]);

const pathGen = geoPath().projection(projection);

let bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];

topo.features.forEach(f => {
    const b = pathGen.bounds(f);
    bounds[0][0] = Math.min(bounds[0][0], b[0][0]);
    bounds[0][1] = Math.min(bounds[0][1], b[0][1]);
    bounds[1][0] = Math.max(bounds[1][0], b[1][0]);
    bounds[1][1] = Math.max(bounds[1][1], b[1][1]);
});

console.log("Map Bounding Box:", bounds);
