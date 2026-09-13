const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Let's find all script blocks in index.html
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
const scripts = [];
while ((match = scriptRegex.exec(html)) !== null) {
  const fullTag = match[0];
  const scriptTag = fullTag.slice(0, fullTag.indexOf('>') + 1);
  const code = match[1].trim();
  if (scriptTag.includes('application/ld+json')) continue;
  if (!code) continue;
  scripts.push(code);
}

console.log('Found', scripts.length, 'inline scripts in index.html');

// Parse all IDs present in index.html
const idRegex = /id=["']([^"']+)["']/g;
const ids = new Set();
let m;
while ((m = idRegex.exec(html)) !== null) {
  ids.add(m[1]);
}
console.log('Total IDs found in index.html:', ids.size);

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

const windowListeners = {};
global.window = {
  addEventListener: (e, h) => {
    console.log('[window.addEventListener]', e);
    windowListeners[e] = windowListeners[e] || [];
    windowListeners[e].push(h);
  },
  matchMedia: () => ({ matches: false }),
  location: { search: '' },
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  scrollTo: () => {},
  scrollY: 0
};
global.document = {
  getElementById: (id) => {
    if (elements[id]) return elements[id];
    console.warn('[document.getElementById NOT FOUND in index.html]:', id);
    return null;
  },
  querySelector: (sel) => null,
  querySelectorAll: () => [],
  body: elementProxy('body'),
  documentElement: elementProxy('documentElement'),
  addEventListener: (e, h) => {}
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

scripts.forEach((code, idx) => {
  console.log(`--- Running Script ${idx + 1} ---`);
  try {
    eval(code);
    console.log(`Script ${idx + 1} ran successfully!`);
  } catch (e) {
    console.error(`Script ${idx + 1} runtime error:`, e);
  }
});

// Trigger load event
console.log('--- Triggering window load ---');
if (windowListeners['load']) {
  windowListeners['load'].forEach(fn => {
    try { fn(); } catch (e) { console.error('Error in window load listener:', e); }
  });
}
