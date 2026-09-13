const fs = require('fs');

let pageContent = fs.readFileSync('app/pageContent.js', 'utf8');

// Replace exact strings safely without infinite loop
pageContent = pageContent.split('https://resolvemun.in/images/').join('/images/');
pageContent = pageContent.split('\"images/').join('\"/images/');
pageContent = pageContent.split('\'images/').join('\'/images/');
pageContent = pageContent.split('(images/').join('(/images/');

fs.writeFileSync('app/pageContent.js', pageContent, 'utf8');
console.log('Successfully updated app/pageContent.js with local asset paths!');
