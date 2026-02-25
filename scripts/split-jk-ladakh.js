const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/states.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

const jkIndex = data.states.findIndex(s => s.id === 'jammu-kashmir');
if (jkIndex !== -1) {
    const jk = data.states[jkIndex];

    // Separate Facts
    const ladakhFacts = [];
    const newJkFacts = [];
    jk.facts.forEach(f => {
        if (f.includes('Brokpa') || f.includes('Pashmina') || f.includes('Ladakh')) {
            ladakhFacts.push(f);
        } else {
            newJkFacts.push(f);
        }
    });
    jk.facts = newJkFacts;

    // Separate Monuments
    const ladakhMonuments = [];
    const newJkMonuments = [];
    jk.monuments.forEach(m => {
        if (m.title.includes('Alchi') || m.title.includes('Thicksey')) {
            ladakhMonuments.push({
                ...m,
                title: m.title.replace('Jammu & Kashmir-', 'Ladakh-'),
                name: m.name.replace('Jammu & Kashmir-', 'Ladakh-')
            });
        } else {
            newJkMonuments.push(m);
        }
    });
    jk.monuments = newJkMonuments;

    // Create Ladakh object
    const ladakh = {
        id: "ladakh",
        name: "Ladakh",
        geography: {
            capital: "Leh",
            key_cities: []
        },
        facts: ladakhFacts,
        art_forms: {
            paintings: [],
            performing_arts: [],
            handicrafts: []
        },
        monuments: ladakhMonuments,
        fairs_and_festivals: [],
        museums: []
    };

    // Insert Ladakh immediately after J&K
    data.states.splice(jkIndex + 1, 0, ladakh);

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Successfully split Jammu & Kashmir and Ladakh.');
} else {
    console.log('Jammu & Kashmir not found in states.json');
}
