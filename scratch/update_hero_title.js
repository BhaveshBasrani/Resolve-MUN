const fs = require('fs');

let content = fs.readFileSync('app/pageContent.js', 'utf8');

const targetEscaped = '<span class=\\"mun\\">2.0</span>';
const replacementEscaped = '<span class=\\"mun\\">MUN 2.0</span>';

const targetUnescaped = '<span class="mun">2.0</span>';
const replacementUnescaped = '<span class="mun">MUN 2.0</span>';

if (content.includes(targetEscaped)) {
  content = content.replace(targetEscaped, replacementEscaped);
  fs.writeFileSync('app/pageContent.js', content, 'utf8');
  console.log('Replaced escaped version with "MUN 2.0" successfully!');
} else if (content.includes(targetUnescaped)) {
  content = content.replace(targetUnescaped, replacementUnescaped);
  fs.writeFileSync('app/pageContent.js', content, 'utf8');
  console.log('Replaced unescaped version with "MUN 2.0" successfully!');
} else {
  console.error('Target not found in app/pageContent.js!');
}
