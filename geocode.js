const fs = require('fs');
const states = JSON.parse(fs.readFileSync('src/data/states.json', 'utf8')).states;

const placesToFind = [];
states.forEach(state => {
  if (state.monuments) {
    state.monuments.forEach(m => {
      placesToFind.push({ id: m.id, title: m.title, state: state.name });
    });
  }
});

console.log(`Found ${placesToFind.length} monuments to geocode.`);
