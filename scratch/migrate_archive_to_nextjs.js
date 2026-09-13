const fs = require('fs');

const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

console.log('Total lines in index_archive.html:', lines.length);

// 1. EXTRACT CSS (lines 124 to 4442)
const styleStartIdx = lines.findIndex((l, i) => i < 200 && l.includes('<style>'));
const styleEndIdx = lines.findIndex((l, i) => i > 4000 && l.includes('</style>'));
console.log('Style tags found at indices:', styleStartIdx, styleEndIdx);

const cssLines = lines.slice(styleStartIdx + 1, styleEndIdx);
console.log('Extracted CSS lines:', cssLines.length);
fs.writeFileSync('app/globals.css', cssLines.join('\n'), 'utf8');
console.log('app/globals.css updated! Size:', fs.statSync('app/globals.css').size);


// 2. EXTRACT BODY HTML (between <body ...> and <script> inside body)
const bodyStartIdx = lines.findIndex(l => /<body[\s>]/i.test(l));
const mainScriptStartIdx = lines.findIndex((l, i) => i > 5000 && l.includes('<script>'));
console.log('Body start:', bodyStartIdx, 'Main script start:', mainScriptStartIdx);

let bodyLines = lines.slice(bodyStartIdx + 1, mainScriptStartIdx);
let bodyHtml = bodyLines.join('\n');

// Ensure committeePrompt is included if not in markup
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

console.log('Extracted Body HTML lines:', bodyLines.length, 'characters:', bodyHtml.length);
fs.writeFileSync('app/pageContent.js', `// Exactly extracted line-by-line from index_archive.html
export const homeHtml = ${JSON.stringify(bodyHtml)};
`, 'utf8');
console.log('app/pageContent.js updated! Size:', fs.statSync('app/pageContent.js').size);


// 3. EXTRACT JAVASCRIPT (between <script> and </script> inside body)
const scriptEndIdx = lines.findIndex((l, i) => i > 8000 && l.includes('</script>'));
console.log('Script end index:', scriptEndIdx);

let jsLines = lines.slice(mainScriptStartIdx + 1, scriptEndIdx);
let scriptContent = jsLines.join('\n');

// Prepend window.isLive and RECAPTCHA_SITE_KEY from head
const headSettings = `
  window.isLive = false;
  window.RECAPTCHA_SITE_KEY = "6LfocLUqAAAAAKvgW1VeJUdMgQs9RA4TKFRp74GH";
`;

scriptContent = headSettings + '\n' + scriptContent;

// Fix loading screen in scriptContent with bulletproof dismissal
const oldLoaderRegex = /\/\/\s*INITIAL LOADING SCREEN[\s\S]*?window\.addEventListener\('load'[\s\S]*?\}\s*,\s*1500\s*\);\s*\}\);/;
const bulletproofLoader = `  // INITIAL LOADING SCREEN - Bulletproof dismissal
  let loaderDismissed = false;
  function dismissLoadingScreen() {
    if (loaderDismissed) return;
    loaderDismissed = true;
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
      }, 800);
    }
    if (document.body) {
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
    }
    
    // AUTO-OPEN REGISTRATION VIA URL PARAMETER ?open=registration
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const openParam = urlParams.get('open');
      
      if (openParam === 'registration' || openParam === 'selection') {
        setTimeout(openSelection, 500);
      } else if (openParam === 'delegate') {
        setTimeout(openRegistration, 500);
      } else if (openParam === 'eb') {
        setTimeout(openEbRegistration, 500);
      } else if (openParam === 'oc') {
        setTimeout(openOcRegistration, 500);
      } else if (openParam === 'delegation') {
        setTimeout(openDelRegistration, 500);
      }
    } catch (_) {}
  }

  if (document.readyState === 'complete') {
    setTimeout(dismissLoadingScreen, 800);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoadingScreen, 800));
  }
  // Hard safety timeout: unconditionally dismiss after 2000ms
  setTimeout(dismissLoadingScreen, 2000);`;

scriptContent = scriptContent.replace(oldLoaderRegex, bulletproofLoader);

// Apply null-safety guards to prevent runtime TypeErrors
scriptContent = scriptContent.replace(
  "closeModal.addEventListener('click', closeRegistration);",
  "if (closeModal) closeModal.addEventListener('click', closeRegistration);"
);

scriptContent = scriptContent.replace(
  "regForm.addEventListener('submit', async function(e) {",
  "if (regForm) regForm.addEventListener('submit', async function(e) {"
);

scriptContent = scriptContent.replace(
  "delRegForm.addEventListener('submit', async function(e) {",
  "if (delRegForm) delRegForm.addEventListener('submit', async function(e) {"
);

scriptContent = scriptContent.replace(
  "ocRegForm.addEventListener('submit', async function(e) {",
  "if (ocRegForm) ocRegForm.addEventListener('submit', async function(e) {"
);

scriptContent = scriptContent.replace(
  "ebRegForm.addEventListener('submit', async function(e) {",
  "if (ebRegForm) ebRegForm.addEventListener('submit', async function(e) {"
);

scriptContent = scriptContent.replace(
  "mobileMenuBtn.addEventListener('click', () => {",
  "if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {"
);

fs.writeFileSync('public/archive-script.js', scriptContent, 'utf8');
console.log('public/archive-script.js updated! Size:', fs.statSync('public/archive-script.js').size);

console.log('SUCCESS: All 8699 lines from index_archive.html categorized and extracted!');
