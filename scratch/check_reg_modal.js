const { homeHtml } = require('../app/pageContent.js');
const idx = homeHtml.indexOf('id="regModal"');
console.log(homeHtml.substring(idx - 50, idx + 450));
