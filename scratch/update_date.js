const fs = require('fs');

let content = fs.readFileSync('app/pageContent.js', 'utf8');

// Replace date occurrences with 21st November 2026
content = content.replace(/June 12th — 14th 2026/g, 'November 21st 2026');
content = content.replace(/June 12th — 14th, 2026/g, 'November 21st, 2026');
content = content.replace(/June 12-14, 2026/g, 'November 21, 2026');
content = content.replace(/June 2026/g, 'November 2026');

fs.writeFileSync('app/pageContent.js', content, 'utf8');
console.log('Updated date in app/pageContent.js to 21st November 2026!');
