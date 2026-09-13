const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/pageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

const heroIdx = content.indexOf('id=\\"hero\\"');
console.log('Hero index:', heroIdx);
if (heroIdx !== -1) {
  console.log(content.slice(heroIdx - 20, heroIdx + 1200));
}
