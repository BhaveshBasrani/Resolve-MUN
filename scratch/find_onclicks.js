const { homeHtml } = require('../app/pageContent.js');
const regex = /onclick="([^"]+)"/g;
let m;
const handlers = new Set();
while ((m = regex.exec(homeHtml)) !== null) {
  handlers.add(m[1].split('(')[0].trim());
}
console.log('Unique functions called from onclick:');
Array.from(handlers).sort().forEach(h => console.log(' - ' + h));
