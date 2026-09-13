const fs = require('fs');
const content = fs.readFileSync('app/pageContent.js', 'utf8');
console.log('Has selectionModal escaped:', content.includes('id=\\"selectionModal\\"'));
console.log('Has register escaped:', content.includes('id=\\"register\\"'));
console.log('Has secModal escaped:', content.includes('id=\\"secModal\\"'));
