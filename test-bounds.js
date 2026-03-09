const fs = require('fs');
const d3 = require('d3');
const geoData = JSON.parse(fs.readFileSync('public/india-states.json'));
const odisha = geoData.features.find(f => f.properties.st_nm === 'Odisha');
console.log('Found Odisha:', !!odisha);
if(odisha) {
  const projection = d3.geoMercator().fitSize([800, 850], geoData);
  const pathGen = d3.geoPath().projection(projection);
  console.log('Bounds:', pathGen.bounds(odisha));
}
