const fs = require('fs');
const js = fs.readFileSync('public/archive-script.js', 'utf8');

const elementProxy = (id) => ({
  id,
  style: {},
  classList: {
    add: () => {},
    remove: () => {},
    contains: () => false
  },
  addEventListener: () => {},
  setAttribute: () => {},
  getAttribute: () => '',
  querySelectorAll: () => [],
  querySelector: () => null,
  innerText: '',
  innerHTML: '',
  value: '',
  dataset: {},
  getContext: () => ({
    clearRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {}
  })
});

global.window = {
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  location: { search: '' },
  requestAnimationFrame: () => {},
  scrollTo: () => {},
  scrollY: 0
};
global.document = {
  getElementById: (id) => elementProxy(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: elementProxy('body'),
  documentElement: elementProxy('documentElement'),
  addEventListener: () => {}
};
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
};
global.MutationObserver = class {
  observe() {}
};

try {
  eval(js);
  console.log('Type of window.openCommitteeIntro:', typeof window.openCommitteeIntro);
  console.log('Script ran without error!');
} catch (e) {
  console.error('CRASH in archive-script.js:', e);
}
