import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const extractedDataPath = path.join(rootDir, 'extracted_data.json');
const statesJsonPath = path.join(rootDir, 'src/data/states.json');
const srcDataDir = path.join(rootDir, 'src/data');

const rawData = JSON.parse(fs.readFileSync(extractedDataPath, 'utf8'));
const statesData = JSON.parse(fs.readFileSync(statesJsonPath, 'utf8'));

// Mappings from Google Sheet Names to states.json Names
const nameMapping = {
    "Odisha": "Orissa",
    "Telangana": "Andhra Pradesh", // Group with Andhra since Telangana is not in states.json
    "Uttarakhand": "Uttarkhand",
    "Andaman & Nicobar Islands (UT)": "Andaman & Nicobar",
    "Chandigarh (UT)": "Chandigarh",
    "Dadra and Nagar Haveli & Daman and Diu (UT)": "Dadar & Nagar Haveli",
    "Delhi (UT)": "Delhi",
    "Jammu & Kashmir (UT)": "Jammu & Kashmir",
    "Ladakh (UT)": "Jammu & Kashmir",
    "Lakshadweep (UT)": "Lakshadweep",
    "Puducherry (UT)": "Puducherry"
};

function normalizeStateName(name) {
    if (!name) return "";
    let n = name.trim();
    return nameMapping[n] || n;
}

const sheet1 = rawData['Sheet1'] || [];

for (const row of sheet1) {
    const stateName = normalizeStateName(row['State / UT']);
    if (!stateName) continue;

    const stateObj = statesData.states.find(s => s.name.toLowerCase() === stateName.toLowerCase());

    if (stateObj) {
        if (!stateObj.art_forms) stateObj.art_forms = {};
        if (!stateObj.art_forms.paintings) stateObj.art_forms.paintings = [];
        if (!stateObj.art_forms.performing_arts) stateObj.art_forms.performing_arts = [];
        if (!stateObj.art_forms.handicrafts) stateObj.art_forms.handicrafts = [];
        if (!stateObj.facts) stateObj.facts = [];

        // Visual arts -> paintings
        if (row['Visual arts']) {
            stateObj.art_forms.paintings.push({
                id: `va_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                title: "Visual Arts",
                desc: row['Visual arts']
            });
        }

        // Performing arts -> performing_arts
        if (row['Performing arts']) {
            stateObj.art_forms.performing_arts.push({
                id: `pa_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                title: "Performing Arts",
                desc: row['Performing arts']
            });
        }

        // Other fields -> facts
        const factsToAdd = [];
        if (row['Textile']) factsToAdd.push(`Textile: ${row['Textile']}`);
        if (row['Artists']) factsToAdd.push(`Artists: ${row['Artists']}`);
        if (row['Tribal culture']) factsToAdd.push(`Tribal Culture: ${row['Tribal culture']}`);
        if (row['Tribal dance']) factsToAdd.push(`Tribal Dance: ${row['Tribal dance']}`);

        stateObj.facts.push(...factsToAdd);
    } else {
        console.warn(`State not found in states.json: ${stateName}`);
    }
}

// Write states.json back
fs.writeFileSync(statesJsonPath, JSON.stringify(statesData, null, 2));
console.log('Updated states.json successfully.');

// Write other sheets
const targetFiles = {
    'Songs and Artists': 'songs_and_artists.json',
    'Pan India classical Dance Forms': 'classical_dances.json',
    'Folk Dance of Pan India': 'folk_dances.json',
    'Stories': 'stories.json',
    'GI Tag of 2025': 'gi_tags.json',
    'Sheet7': 'embroidery_and_puppets.json'
};

for (const [sheetName, filename] of Object.entries(targetFiles)) {
    if (rawData[sheetName]) {
        const destPath = path.join(srcDataDir, filename);
        fs.writeFileSync(destPath, JSON.stringify(rawData[sheetName], null, 2));
        console.log(`Created ${filename} successfully.`);
    } else {
        console.warn(`Sheet not found: ${sheetName}`);
    }
}

console.log('Data integration complete.');
