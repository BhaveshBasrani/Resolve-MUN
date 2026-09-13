const fs = require('fs');

const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

const heroStart = lines.findIndex(l => l.includes('<section id="hero"'));
const heroEnd = lines.findIndex((l, i) => i > heroStart && l.includes('</section>'));

console.log('=== ORIGINAL HERO FROM index_archive.html ===');
console.log(lines.slice(heroStart, heroEnd + 1).join('\n'));
