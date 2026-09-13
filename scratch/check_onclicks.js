const fs = require('fs');
const pageContentJs = fs.readFileSync('app/pageContent.js', 'utf8');
const match = pageContentJs.match(/export const homeHtml = ([\s\S]*?);\s*$/);
const html = JSON.parse(match[1]);

const onClicks = new Set();
const regex = /onclick=["']([^"']+)["']/g;
let m;
while ((m = regex.exec(html)) !== null) {
  onClicks.add(m[1].trim());
}
console.log('All onClicks found in pageContent:');
Array.from(onClicks).sort().forEach(c => console.log(' - ' + c));
