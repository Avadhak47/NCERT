const fs = require('fs');
const https = require('https');

const statesData = JSON.parse(fs.readFileSync('src/data/states.json', 'utf8'));
const states = statesData.states;

async function geocode(query) {
    return new Promise((resolve) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'NCERT-App/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.length > 0) {
                        resolve({ lat: parseFloat(parsed[0].lat), lon: parseFloat(parsed[0].lon) });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

// We just do it synchronously for simplicity in this script, or with a delay
async function main() {
    let modified = false;
    for (const state of states) {
        if (!state.monuments) continue;
        for (const monument of state.monuments) {
            if (monument.lat && monument.lon) continue; // Already geocoded

            // Extract clean name, e.g., "Andhra Pradesh- Monument- Golconda fort" -> "Golconda fort"
            let cleanTitle = monument.title.split('-').pop().trim();
            let query = `${cleanTitle}, ${state.name}, India`;
            console.log(`Geocoding ${query}`);

            let coords = await geocode(query);
            if (!coords) {
                // fallback
                coords = await geocode(`${state.capital || state.name}, India`);
                // Add some random scatter so they don't all stack
                if (coords) {
                    coords.lat += (Math.random() - 0.5) * 2;
                    coords.lon += (Math.random() - 0.5) * 2;
                }
            }

            if (coords) {
                monument.lat = coords.lat;
                monument.lon = coords.lon;
                modified = true;
            }
            // Be nice to Nominatim
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (modified) {
        fs.writeFileSync('src/data/states.json', JSON.stringify(statesData, null, 2));
        console.log("Updated states.json with coordinates.");
    } else {
        console.log("No new coordinates to update.");
    }
}

main();
