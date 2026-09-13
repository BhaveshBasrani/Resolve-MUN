const fs = require('fs');
const js = fs.readFileSync('public/archive-script.js', 'utf8');
const pageContentJs = fs.readFileSync('app/pageContent.js', 'utf8');

// Extract homeHtml from app/pageContent.js
const innerHtmlMatch = pageContentJs.match(/export const homeHtml = ([\s\S]*?);\s*$/);
if (!innerHtmlMatch) {
  console.log('Could not extract homeHtml');
  process.exit(1);
}
const innerHtml = JSON.parse(innerHtmlMatch[1]);
console.log('Extracted innerHtml, length:', innerHtml.length);

// Parse all IDs present in the HTML
const idRegex = /id=["']([^"']+)["']/g;
const ids = new Set();
let m;
while ((m = idRegex.exec(innerHtml)) !== null) {
  ids.add(m[1]);
}
console.log('Total IDs found in innerHTML:', ids.size);

const elementProxy = (id) => ({
  id,
  style: {},
  classList: {
    add: (...c) => console.log(`[DOM] #${id}.classList.add(${c.join(', ')})`),
    remove: (...c) => console.log(`[DOM] #${id}.classList.remove(${c.join(', ')})`),
    contains: () => false
  },
  addEventListener: (event, handler) => {
    // console.log(`[DOM] #${id}.addEventListener(${event})`);
  },
  setAttribute: () => {},
  getAttribute: () => '',
  querySelectorAll: () => [],
  querySelector: () => null,
  innerText: '',
  innerHTML: '',
  value: '',
  tagName: 'DIV'
});

const elements = {};
ids.forEach(id => { elements[id] = elementProxy(id); });

global.window = {
  addEventListener: (e, h) => {
    // console.log('[window.addEventListener]', e);
    if (e === 'load') {
      setTimeout(() => {
        console.log('Triggering window load event listener...');
        try { h(); } catch (err) { console.error('ERROR in load listener:', err); }
      }, 50);
    }
  },
  matchMedia: () => ({ matches: false }),
  location: { search: '' },
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  scrollTo: () => {}
};
global.document = {
  getElementById: (id) => {
    if (elements[id]) return elements[id];
    console.warn('[document.getElementById NOT FOUND]:', id);
    return null;
  },
  querySelector: (sel) => null,
  querySelectorAll: () => [],
  body: elementProxy('body'),
  documentElement: elementProxy('documentElement'),
  addEventListener: () => {}
};
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.MutationObserver = class {
  observe() {}
  disconnect() {}
};

try {
  eval(js);
  console.log('Script parsed and ran top-level code successfully without ANY errors!');
} catch (e) {
  console.error('ERROR during script execution:', e);
}
