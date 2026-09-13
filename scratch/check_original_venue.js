const fs = require('fs');

const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

const venueStart = lines.findIndex(l => l.includes('<section id="venue"'));
const venueEnd = lines.findIndex((l, i) => i > venueStart && l.includes('</section>'));

console.log('=== ORIGINAL VENUE FROM index_archive.html ===');
console.log(lines.slice(venueStart, venueEnd + 1).join('\n'));
