const fs = require('fs');
const d3 = require('d3');
const { geoMercator, geoPath } = require('d3-geo');

const mapData = JSON.parse(fs.readFileSync('./public/india-states.json', 'utf8'));

const width = 800;
const height = 850;

const projection = geoMercator().fitSize([width, height], mapData);
const pathGenerator = geoPath().projection(projection);

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -60 840 980" width="800" height="850">`;

mapData.features.forEach((f) => {
    svg += `<path d="${pathGenerator(f)}" fill="none" stroke="black" />`;
    // Add a text label to see what is where
    const centroid = pathGenerator.centroid(f);
    if (!isNaN(centroid[0])) {
      svg += `<text x="${centroid[0]}" y="${centroid[1]}" font-size="10">${f.properties.ST_NM}</text>`;
    }
});

svg += `</svg>`;
fs.writeFileSync('./public/test-map.svg', svg);
console.log('SVG written to public/test-map.svg');
