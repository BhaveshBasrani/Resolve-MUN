const fs = require('fs');
const js = fs.readFileSync('app/pageContent.js', 'utf8');
const match = js.match(/export const homeHtml = ([\s\S]*?);\s*$/);
const html = JSON.parse(match[1]);

['hero', 'countdown', 'about', 'letter', 'committees', 'venue', 'secretariat', 'sponsors', 'register', 'footer'].forEach(s => {
  console.log(`Section/Element #${s}:`, html.includes(`id="${s}"`) || html.includes(`<${s}`));
});
