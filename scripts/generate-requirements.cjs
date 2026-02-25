const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/states.json');
const outputPath = path.join(__dirname, '../content_requirements.md');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

let markdown = `# Content Requirements & Missing Assets\n\n`;
markdown += `This document tracks all the cultural data, monuments, art forms, and other assets that are currently missing images (or using external Unsplash placeholders) in the local \`states.json\` database. These assets need to be gathered, optimized (WebP format), and placed in the \`public/state-images/\` directory.\n\n`;

let totalMissing = 0;

data.states.forEach(state => {
    let stateMissing = [];

    const checkItem = (item, category) => {
        if (!item) return;
        const name = item.title || item.name || 'Unnamed Item';
        // Check if img is missing, empty, or an external http URL
        if (!item.img || item.img.trim() === '' || item.img.startsWith('http')) {
            stateMissing.push({ name, category, currentImg: item.img || 'None' });
            totalMissing++;
        }
    };

    // Check monuments
    if (state.monuments) {
        state.monuments.forEach(m => checkItem(m, 'Monument'));
    }

    // Check art forms
    if (state.art_forms) {
        if (state.art_forms.paintings) state.art_forms.paintings.forEach(p => checkItem(p, 'Painting'));
        if (state.art_forms.performing_arts) state.art_forms.performing_arts.forEach(p => checkItem(p, 'Performing Art'));
        if (state.art_forms.handicrafts) state.art_forms.handicrafts.forEach(p => checkItem(p, 'Handicraft'));
    }

    // Check fairs and festivals
    if (state.fairs_and_festivals) {
        state.fairs_and_festivals.forEach(f => checkItem(f, 'Fair/Festival'));
    }

    // Check museums
    if (state.museums) {
        state.museums.forEach(m => checkItem(m, 'Museum'));
    }

    if (stateMissing.length > 0) {
        markdown += `## ${state.name}\n\n`;
        markdown += `| Category | Item Name | Current Image |\n`;
        markdown += `|----------|-----------|---------------|\n`;
        stateMissing.forEach(item => {
            markdown += `| ${item.category} | ${item.name} | \`${item.currentImg}\` |\n`;
        });
        markdown += `\n`;
    }
});

markdown = `**Total Missing Assets: ${totalMissing}**\n\n` + markdown;

fs.writeFileSync(outputPath, markdown);
console.log(`Generated content_requirements.md with ${totalMissing} missing assets.`);
