const fs = require('fs');
const content = fs.readFileSync('app/pageContent.js', 'utf8');

const selIndex = content.indexOf('id=\\"selectionModal\\"');
console.log('selIndex:', selIndex);
if (selIndex !== -1) {
  console.log('Snippet around selectionModal:\n', content.slice(selIndex - 50, selIndex + 300));
}

const ctaIndex = content.indexOf('cta-actions');
console.log('ctaIndex:', ctaIndex);
if (ctaIndex !== -1) {
  console.log('Snippet around cta-actions:\n', content.slice(ctaIndex - 50, ctaIndex + 350));
}
