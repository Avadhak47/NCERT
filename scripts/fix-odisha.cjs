const fs = require('fs');
const filePath = 'public/india-states.json';
const geoData = JSON.parse(fs.readFileSync(filePath));
const odishaIdx = geoData.features.findIndex(f => f.properties.st_nm === 'Odisha');
if (odishaIdx !== -1) {
    // Poly 5 is the outlier based on previous test bounds
    geoData.features[odishaIdx].geometry.coordinates.splice(5, 1);
    fs.writeFileSync(filePath, JSON.stringify(geoData, null, 4));
    console.log('Successfully removed outlier polygon from Odisha');
} else {
    console.log('Odisha not found');
}
