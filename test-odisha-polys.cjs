const fs = require('fs');
const d3 = require('d3');
const geoData = JSON.parse(fs.readFileSync('public/india-states.json'));
const odisha = geoData.features.find(f => f.properties.st_nm === 'Odisha');
const projection = d3.geoMercator().fitSize([800, 850], geoData);
const pathGen = d3.geoPath().projection(projection);

odisha.geometry.coordinates.forEach((poly, i) => {
    const feature = { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: [poly] } };
    console.log(`Poly ${i} bounds:`, pathGen.bounds(feature));
});
