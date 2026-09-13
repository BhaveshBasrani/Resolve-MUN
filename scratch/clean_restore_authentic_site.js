const fs = require('fs');
const path = require('path');

// 1. READ ORIGINAL HTML FROM index_archive.html
const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

const bodyStartIdx = lines.findIndex(l => /<body[\s>]/i.test(l));
const mainScriptStartIdx = lines.findIndex((l, i) => i > 5000 && l.includes('<script>'));

let bodyLines = lines.slice(bodyStartIdx + 1, mainScriptStartIdx);
let bodyHtml = bodyLines.join('\n');

// A. Replace external https://resolvemun.in/images/ with local /images/ for instant, reliable loading
bodyHtml = bodyHtml.replace(/https:\/\/resolvemun.in\/images\//g, '/images/');

// B. Update Hero Title to RESOLVE MUN 2.0
bodyHtml = bodyHtml.replace(
  /<h1 class="hero-title">[\s\S]*?<\/h1>/,
  `<h1 class="hero-title">
    <span>RESOLVE</span>
    <span class="mun">MUN 2.0</span>
  </h1>`
);

// C. Initialize hero values to actual numbers instead of 0
bodyHtml = bodyHtml.replace(
  /<span class="value" data-target="2026">0<\/span>/,
  '<span class="value" data-target="2026">2026</span>'
);
bodyHtml = bodyHtml.replace(
  /<span class="value" data-target="250">0<\/span>/,
  '<span class="value" data-target="250">250</span>'
);
bodyHtml = bodyHtml.replace(
  /<span class="value" data-target="7">0<\/span>/,
  '<span class="value" data-target="7">7</span>'
);
bodyHtml = bodyHtml.replace(
  /<span class="value" data-target="3">0<\/span>/,
  '<span class="value" data-target="3">3</span>'
);

// D. Ensure committeePrompt is in place
if (!bodyHtml.includes('id="committeePrompt"')) {
  const promptMarkup = `
<div aria-hidden="true" class="committee-prompt" id="committeePrompt">
  <div class="committee-prompt__text">
    CHOOSE YOUR COMMITTEE
    <span class="committee-prompt__subtext">Background guides are live</span>
  </div>
</div>
`;
  bodyHtml = bodyHtml.replace('</nav>', '</nav>\n' + promptMarkup);
}

// E. Add the clean Typeform progress bar to regModal if not present
if (!bodyHtml.includes('id="regProgressFill"')) {
  bodyHtml = bodyHtml.replace(
    '<div class="modal-header">',
    '<div class="modal-progress-bar"><div class="modal-progress-fill" id="regProgressFill" style="width: 33.33%;"></div></div>\n    <div class="modal-header">\n      <div class="step-indicator" id="regStepBadge">Step 01 / 03 · Personal Details</div>'
  );
}

// Write clean authentic pageContent.js (NO FAKE AI SECTIONS!)
fs.writeFileSync('app/pageContent.js', `// Clean authentic Resolve MUN 2.0 content from index_archive.html
export const homeHtml = ${JSON.stringify(bodyHtml)};
`, 'utf8');

console.log('Successfully updated app/pageContent.js with authentic content!');
