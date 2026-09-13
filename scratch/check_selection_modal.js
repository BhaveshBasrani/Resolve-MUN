const { homeHtml } = require('../app/pageContent.js');
const idx = homeHtml.indexOf('id="selectionModal"');
console.log(homeHtml.substring(idx, idx + 600));
