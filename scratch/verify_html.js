const fs = require('fs');

const pageContent = fs.readFileSync('app/pageContent.js', 'utf8');

const sections = [
  'hero',
  'countdown',
  'about',
  'letter',
  'committees',
  'venue',
  'secretariat',
  'sponsors',
  'oc-applications',
  'eb-applications',
  'register',
  'footer'
];

sections.forEach(s => {
  console.log(s, pageContent.includes(s) ? '✓ Present' : '✗ Missing');
});
