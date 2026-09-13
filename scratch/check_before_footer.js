const fs = require('fs');

const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

const footerStart = lines.findIndex(l => l.includes('<footer'));
console.log('=== BEFORE FOOTER IN index_archive.html ===');
console.log(lines.slice(footerStart - 40, footerStart).join('\n'));
