const fs = require('fs');
const geoData = JSON.parse(fs.readFileSync('public/india-states.json'));
const STATE_NAME_MAPPING = {
    'Andaman and Nicobar Islands': 'Andaman & Nicobar',
    'ANDAMAN & NICOBAR ISLANDS': 'Andaman & Nicobar',
    'Dadra and Nagar Haveli': 'Dadar & Nagar Haveli',
    'Dadra & Nagar Haveli': 'Dadar & Nagar Haveli',
    'Daman and Diu': 'Daman & Diu',
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Odisha': 'Orissa',
    'Uttarakhand': 'Uttarkhand',
    'LAKSHADWEEP': 'Lakshadweep'
};
const activeState = 'Orissa';
const features = geoData.features.filter(f => {
    const rawName = f.properties.st_nm;
    const n = STATE_NAME_MAPPING[rawName] || rawName;
    return n === activeState;
});
console.log('Features matching activeState "Orissa":', features.length);
if (features.length > 0) {
    features.forEach(f => console.log('Raw name:', f.properties.st_nm));
}
