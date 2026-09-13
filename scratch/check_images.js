const fs = require('fs');

const content = fs.readFileSync('app/pageContent.js', 'utf8');
const urls = content.match(/(\/images\/[^\s"'<>\)]+|https:\/\/resolvemun\.in\/[^\s"'<>\)]+|images\/[^\s"'<>\)]+)/g) || [];
console.log('Images in app/pageContent.js:', [...new Set(urls)]);
