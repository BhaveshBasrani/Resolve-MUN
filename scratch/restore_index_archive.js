const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

console.log('Total lines in index_archive.html:', lines.length);

// =========================================================================
// 1. EXTRACT CSS EXACTLY FROM index_archive.html (lines 124 to 4442)
// =========================================================================
const styleStartIdx = lines.findIndex((l, i) => i < 200 && l.includes('<style>'));
const styleEndIdx = lines.findIndex((l, i) => i > 4000 && l.includes('</style>'));
console.log('Style tags found at indices:', styleStartIdx, styleEndIdx);

let cssLines = lines.slice(styleStartIdx + 1, styleEndIdx);
let cssContent = cssLines.join('\n');

// Ensure reveal elements are visible and smooth in Next.js
cssContent += `\n
/* Next.js reveal enhancement to guarantee visibility */
.reveal {
  opacity: 1 !important;
  transform: none !important;
}
`;

fs.writeFileSync('app/globals.css', cssContent, 'utf8');
console.log('Restored app/globals.css from index_archive.html! Size:', fs.statSync('app/globals.css').size);


// =========================================================================
// 2. EXTRACT BODY HTML EXACTLY FROM index_archive.html
// =========================================================================
const bodyStartIdx = lines.findIndex(l => /<body[\s>]/i.test(l));
const mainScriptStartIdx = lines.findIndex((l, i) => i > 5000 && l.includes('<script>'));
console.log('Body start:', bodyStartIdx, 'Main script start:', mainScriptStartIdx);

let bodyLines = lines.slice(bodyStartIdx + 1, mainScriptStartIdx);
let bodyHtml = bodyLines.join('\n');

// Ensure committeePrompt is included
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

fs.writeFileSync('app/pageContent.js', `// Exactly restored from index_archive.html
export const homeHtml = ${JSON.stringify(bodyHtml)};
`, 'utf8');
console.log('Restored app/pageContent.js from index_archive.html! Size:', fs.statSync('app/pageContent.js').size);


// =========================================================================
// 3. EXTRACT JAVASCRIPT EXACTLY FROM index_archive.html
// =========================================================================
const scriptEndIdx = lines.findIndex((l, i) => i > 8000 && l.includes('</script>'));
console.log('Script end index:', scriptEndIdx);

let jsLines = lines.slice(mainScriptStartIdx + 1, scriptEndIdx);
let scriptContent = jsLines.join('\n');

// Head settings
const headSettings = `
  window.isLive = false;
  window.RECAPTCHA_SITE_KEY = "6LfocLUqAAAAAKvgW1VeJUdMgQs9RA4TKFRp74GH";
`;
scriptContent = headSettings + '\n' + scriptContent;

// Bulletproof loading screen dismissal
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
    setTimeout(dismissLoadingScreen, 500);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoadingScreen, 500));
  }
  // Hard safety timeout
  setTimeout(dismissLoadingScreen, 1200);`;

scriptContent = scriptContent.replace(oldLoaderRegex, bulletproofLoader);

// Apply null-safety guards
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

// Wrap in safe IIFE & export all modal and onclick handlers to window
const windowExports = `
  // Global exports for inline HTML onclick handlers
  if (typeof window !== 'undefined') {
    window.openSelectionModal = typeof openSelectionModal !== 'undefined' ? openSelectionModal : () => {};
    window.closeSelectionModal = typeof closeSelectionModal !== 'undefined' ? closeSelectionModal : () => {};
    window.openRegistration = typeof openRegistration !== 'undefined' ? openRegistration : () => {};
    window.closeRegistration = typeof closeRegistration !== 'undefined' ? closeRegistration : () => {};
    window.openDelRegistration = typeof openDelRegistration !== 'undefined' ? openDelRegistration : () => {};
    window.closeDelRegistration = typeof closeDelRegistration !== 'undefined' ? closeDelRegistration : () => {};
    window.openOcRegistration = typeof openOcRegistration !== 'undefined' ? openOcRegistration : () => {};
    window.closeOcRegistration = typeof closeOcRegistration !== 'undefined' ? closeOcRegistration : () => {};
    window.openEbRegistration = typeof openEbRegistration !== 'undefined' ? openEbRegistration : () => {};
    window.closeEbRegistration = typeof closeEbRegistration !== 'undefined' ? closeEbRegistration : () => {};
    window.selectPathway = typeof selectPathway !== 'undefined' ? selectPathway : () => {};
    window.openSelection = typeof openSelection !== 'undefined' ? openSelection : (typeof openSelectionModal !== 'undefined' ? openSelectionModal : () => {});
    window.openTermsModal = typeof openTermsModal !== 'undefined' ? openTermsModal : () => {};
    window.closeTermsModal = typeof closeTermsModal !== 'undefined' ? closeTermsModal : () => {};
    window.openCommModal = typeof openCommModal !== 'undefined' ? openCommModal : () => {};
    window.closeCommModal = typeof closeCommModal !== 'undefined' ? closeCommModal : () => {};
    window.openCommitteeIntro = typeof openCommitteeIntro !== 'undefined' ? openCommitteeIntro : () => {};
    window.showCustomAlert = typeof showCustomAlert !== 'undefined' ? showCustomAlert : (msg) => alert(msg);
    window.nextStep = typeof nextStep !== 'undefined' ? nextStep : () => {};
    window.nextDelStep = typeof nextDelStep !== 'undefined' ? nextDelStep : () => {};
    window.nextOcStep = typeof nextOcStep !== 'undefined' ? nextOcStep : () => {};
    window.nextEbStep = typeof nextEbStep !== 'undefined' ? nextEbStep : () => {};
    window.updatePortfolioOptions = typeof updatePortfolioOptions !== 'undefined' ? updatePortfolioOptions : () => {};
    window.copyUPI = typeof copyUPI !== 'undefined' ? copyUPI : () => {};
    window.copyDelUPI = typeof copyDelUPI !== 'undefined' ? copyDelUPI : () => {};
    window.copyOcUPI = typeof copyOcUPI !== 'undefined' ? copyOcUPI : () => {};
    window.copyEbUPI = typeof copyEbUPI !== 'undefined' ? copyEbUPI : () => {};
    window.refreshDelegatePaymentQR = typeof refreshDelegatePaymentQR !== 'undefined' ? refreshDelegatePaymentQR : () => {};
    window.refreshDelegationPaymentQR = typeof refreshDelegationPaymentQR !== 'undefined' ? refreshDelegationPaymentQR : () => {};
    window.generateDynamicQR = typeof generateDynamicQR !== 'undefined' ? generateDynamicQR : () => {};
  }
`;

const wrappedScript = `(function() {
  if (typeof window !== 'undefined' && window.__archiveScriptInitialized) return;
  if (typeof window !== 'undefined') window.__archiveScriptInitialized = true;

${scriptContent}

${windowExports}
})();
`;

fs.writeFileSync('public/archive-script.js', wrappedScript, 'utf8');
console.log('Restored public/archive-script.js from index_archive.html! Size:', fs.statSync('public/archive-script.js').size);

console.log('COMPLETE RESTORATION FROM index_archive.html FINISHED SUCCESSFULLY!');
