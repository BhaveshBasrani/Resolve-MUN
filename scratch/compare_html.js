const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const pageJsx = fs.readFileSync('app/page.jsx', 'utf8');

console.log('index.html length:', indexHtml.length);
const innerHtmlMatch = pageJsx.match(/containerRef\.current\.innerHTML = ([\s\S]*?);\s*document\.dispatchEvent/);
const innerHtml = JSON.parse(innerHtmlMatch[1]);
console.log('app/page.jsx innerHTML length:', innerHtml.length);

const getModals = (str) => {
  const matches = [];
  const re = /class=["']modal-overlay["'][^>]*id=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    matches.push(m[1]);
  }
  return matches;
};
console.log('Modals in index.html:', getModals(indexHtml));
console.log('Modals in page.jsx:', getModals(innerHtml));
