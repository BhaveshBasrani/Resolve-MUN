const fs = require('fs');
const content = fs.readFileSync('.next/dev/logs/next-development.log', 'utf8');
const lines = content.split('\n');
const errors = new Set();
lines.forEach(l => {
  if (l.includes('"level":"ERROR"') || l.includes('"level":"WARN"')) {
    try {
      const obj = JSON.parse(l);
      errors.add(obj.message);
    } catch(e) {
      errors.add(l.slice(0, 150));
    }
  }
});
console.log('Unique errors/warnings:');
errors.forEach(e => console.log('-->', e));
