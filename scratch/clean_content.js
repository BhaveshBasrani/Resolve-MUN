const fs = require('fs');

let content = fs.readFileSync('app/pageContent.js', 'utf8');

// 1. Remove SECRETARIAT_PLACEHOLDER
content = content.replace('<!-- SECRETARIAT_PLACEHOLDER -->\n\n', '');
content = content.replace('<!-- SECRETARIAT_PLACEHOLDER -->\r\n\r\n', '');
content = content.replace('<!-- SECRETARIAT_PLACEHOLDER -->', '');

// 2. Remove the old CTA section (Secretariat & OC applications)
const ctaMarker = '<!-- CTA -->';
const ctaIdx = content.indexOf(ctaMarker);
if (ctaIdx !== -1) {
  content = content.substring(0, ctaIdx) + '\n';
  console.log('Removed obsolete CTA section');
} else {
  console.log('ctaMarker not found');
}

fs.writeFileSync('app/pageContent.js', content, 'utf8');
console.log('Successfully cleaned app/pageContent.js!');

