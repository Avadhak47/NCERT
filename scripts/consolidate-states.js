import fs from 'fs';
import path from 'path';

const statesDir = '/Users/avadhesh/development/NCERT/NseeRt/src/data/states';
const outputFile = '/Users/avadhesh/development/NCERT/NCERT/src/data/states.json';

const files = fs.readdirSync(statesDir).filter(f => f.endsWith('.json'));

const result = {
   states: []
};

// Map file names to our known IDs from InteractiveMap.tsx if possible.
const normalizeId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

files.forEach(file => {
   const data = JSON.parse(fs.readFileSync(path.join(statesDir, file), 'utf8'));

   // The file has: { state_name: "...", source_file: "...", sections: [...] }
   // e.g., "Jammu & Kashmir"
   let stateName = data.state_name || file.replace('.json', '').replace(/-/g, ' ');

   // Fix Jammu & Kashmir name so we match Interactive Map if possible, 
   // Interactive Map uses exactly the names from the SVG paths, so we'll see if they match later.
   const stateId = normalizeId(stateName);

   const newState = {
      id: stateId,
      name: stateName,
      geography: {
         capital: "",
         key_cities: []
      },
      facts: [],
      art_forms: {
         paintings: [],
         performing_arts: [],
         handicrafts: []
      },
      monuments: [],
      fairs_and_festivals: [],
      museums: []
   };

   // Process sections
   data.sections.forEach(sec => {
      const heading = (sec.heading || "").toLowerCase();
      const content = sec.content || "";

      let imgSrc = "";
      if (sec.images && sec.images.length > 0) {
         // We might need to copy images into public/ first. The user said to use data there.
         // They are in NseeRt/src/data/states/images and NseeRt/src/data/time-line-images
         if (sec.images[0].new_path) {
            imgSrc = "/state-images/" + sec.images[0].new_path;
         } else if (sec.images[0].original_path) {
            imgSrc = "/" + sec.images[0].original_path.replace("images/", "state-images/");
         }
      }

      const item = {
         id: Math.random().toString(36).substr(2, 9),
         title: sec.heading,
         name: sec.heading, // For monuments/festivals/museums we used `name`, for art_forms we used `title`
         desc: content,
         img: imgSrc,
         historical_significance: sec.timeperiod || "",
         materials: ""
      };

      if (heading.includes('monument') || heading.includes('temple') || heading.includes('tomb') || heading.includes('ruins') || heading.includes('fort') || heading.includes('mosque') || heading.includes('stupa') || heading.includes('palace') || heading.includes('mahal') || heading.includes('caves') || heading.includes('pillar')) {
         newState.monuments.push(item);
      } else if (heading.includes('dance') || heading.includes('music') || heading.includes('performing') || heading.includes('theatre') || heading.includes('martial')) {
         newState.art_forms.performing_arts.push(item);
      } else if (heading.includes('painting') || heading.includes('mural') || heading.includes('fresco') || heading.includes('sculpture')) {
         newState.art_forms.paintings.push(item);
      } else if (heading.includes('art') || heading.includes('handicraft') || heading.includes('wood') || heading.includes('textile') || heading.includes('craft') || heading.includes('papier') || heading.includes('metal') || heading.includes('weave') || heading.includes('pottery')) {
         newState.art_forms.handicrafts.push(item);
      } else if (heading.includes('festival') || heading.includes('fair') || heading.includes('mela')) {
         newState.fairs_and_festivals.push(item);
      } else if (heading.includes('museum') || heading.includes('collection')) {
         newState.museums.push(item);
      } else if (heading.includes('fact')) {
         newState.facts.push(content);
      } else if (heading.includes('city') || heading.includes('capital')) {
         newState.geography.key_cities.push({
            name: sec.heading,
            lat: 0,
            lon: 0
         })
      } else {
         // If we don't know, put as a general fact.
         if (content.trim() !== '') {
            newState.facts.push(`**${sec.heading}**: ${content}`);
         }
      }
   });

   result.states.push(newState);
});

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
console.log(`Successfully merged ${files.length} states into ${outputFile}`);
