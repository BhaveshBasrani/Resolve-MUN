const fs = require('fs');

console.log('=== Applying fixes to public/archive-script.js ===');
let archiveJs = fs.readFileSync('public/archive-script.js', 'utf8');

// 1. Loading screen logic in archive-script.js
const oldLoaderCode = `  // INITIAL LOADING SCREEN
  window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
      
      // AUTO-OPEN REGISTRATION VIA URL PARAMETER ?open=registration
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
    }, 1500); 
  });`;

const newLoaderCode = `  // INITIAL LOADING SCREEN - Bulletproof dismissal
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

if (archiveJs.includes(oldLoaderCode)) {
  archiveJs = archiveJs.replace(oldLoaderCode, newLoaderCode);
  console.log('Replaced loading screen logic in archive-script.js');
} else {
  console.warn('Could not exact-match oldLoaderCode in archive-script.js, checking regex...');
  archiveJs = archiveJs.replace(/\/\/\s*INITIAL LOADING SCREEN[\s\S]*?window\.addEventListener\('load'[\s\S]*?\}\s*,\s*1500\s*\);\s*\}\);/, newLoaderCode);
  console.log('Regex-replaced loading screen logic in archive-script.js');
}

// Null safety checks in archive-script.js
archiveJs = archiveJs.replace(
  "closeModal.addEventListener('click', closeRegistration);",
  "if (closeModal) closeModal.addEventListener('click', closeRegistration);"
);

archiveJs = archiveJs.replace(
  "regForm.addEventListener('submit', async function(e) {",
  "if (regForm) regForm.addEventListener('submit', async function(e) {"
);

archiveJs = archiveJs.replace(
  "delRegForm.addEventListener('submit', async function(e) {",
  "if (delRegForm) delRegForm.addEventListener('submit', async function(e) {"
);

archiveJs = archiveJs.replace(
  "ocRegForm.addEventListener('submit', async function(e) {",
  "if (ocRegForm) ocRegForm.addEventListener('submit', async function(e) {"
);

archiveJs = archiveJs.replace(
  "ebRegForm.addEventListener('submit', async function(e) {",
  "if (ebRegForm) ebRegForm.addEventListener('submit', async function(e) {"
);

archiveJs = archiveJs.replace(
  "mobileMenuBtn.addEventListener('click', () => {",
  "if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {"
);

fs.writeFileSync('public/archive-script.js', archiveJs, 'utf8');
console.log('Updated public/archive-script.js successfully!');


console.log('\n=== Applying fixes to index.html ===');
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Ensure committeePrompt is present
if (!indexHtml.includes('id="committeePrompt"')) {
  const promptMarkup = `
<div aria-hidden="true" class="committee-prompt" id="committeePrompt">
  <div class="committee-prompt__text">
    CHOOSE YOUR COMMITTEE
    <span class="committee-prompt__subtext">Background guides are live</span>
  </div>
</div>
`;
  indexHtml = indexHtml.replace('</nav>', '</nav>\n' + promptMarkup);
  console.log('Added committeePrompt to index.html');
}

// Loading screen logic in index.html
const oldIndexLoader = `  // INITIAL LOADING SCREEN
  window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
      
      // AUTO-OPEN REGISTRATION VIA URL PARAMETER ?open=registration
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
    }, 1500); 
  });`;

if (indexHtml.includes(oldIndexLoader)) {
  indexHtml = indexHtml.replace(oldIndexLoader, newLoaderCode);
  console.log('Replaced loading screen logic in index.html');
} else {
  indexHtml = indexHtml.replace(/\/\/\s*INITIAL LOADING SCREEN[\s\S]*?window\.addEventListener\('load'[\s\S]*?\}\s*,\s*1500\s*\);\s*\}\);/, newLoaderCode);
  console.log('Regex-replaced loading screen logic in index.html');
}

// Null safety checks in index.html
indexHtml = indexHtml.replace(
  "closeModal.addEventListener('click', closeRegistration);",
  "if (closeModal) closeModal.addEventListener('click', closeRegistration);"
);

indexHtml = indexHtml.replace(
  "regForm.addEventListener('submit', async function(e) {",
  "if (regForm) regForm.addEventListener('submit', async function(e) {"
);

indexHtml = indexHtml.replace(
  "delRegForm.addEventListener('submit', async function(e) {",
  "if (delRegForm) delRegForm.addEventListener('submit', async function(e) {"
);

indexHtml = indexHtml.replace(
  "ocRegForm.addEventListener('submit', async function(e) {",
  "if (ocRegForm) ocRegForm.addEventListener('submit', async function(e) {"
);

indexHtml = indexHtml.replace(
  "ebRegForm.addEventListener('submit', async function(e) {",
  "if (ebRegForm) ebRegForm.addEventListener('submit', async function(e) {"
);

indexHtml = indexHtml.replace(
  "mobileMenuBtn.addEventListener('click', () => {",
  "if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {"
);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('Updated index.html successfully!');


console.log('\n=== Applying fixes to admin.html ===');
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Fix switchTab
const oldSwitchTab = `    // Navigation Tabs Toggle
    window.switchTab = function(tabId) {
      document.getElementById('btnTabDelegates').classList.toggle('tab-active', tabId === 'delegatesTab');
      document.getElementById('btnTabWaitlist').classList.toggle('tab-active', tabId === 'waitlistTab');
      document.getElementById('btnTabSolaris').classList.toggle('tab-active', tabId === 'solarisTab');
      document.getElementById('btnTabScanner').classList.toggle('tab-active', tabId === 'scannerTab');

      document.getElementById('delegatesTab').style.display = tabId === 'delegatesTab' ? 'block' : 'none';
      document.getElementById('waitlistTab').style.display = tabId === 'waitlistTab' ? 'block' : 'none';
      document.getElementById('solarisTab').style.display = tabId === 'solarisTab' ? 'block' : 'none';
      document.getElementById('scannerTab').style.display = tabId === 'scannerTab' ? 'block' : 'none';

      if (tabId === 'scannerTab') {
        if (typeof autoDetermineScannerDay === 'function') {
          autoDetermineScannerDay();
        }
        startScanner();
      } else {
        stopScanner();
      }
    };`;

const newSwitchTab = `    // Navigation Tabs Toggle
    window.switchTab = function(tabId) {
      const btnDelegates = document.getElementById('btnTabDelegates');
      const btnWaitlist = document.getElementById('btnTabWaitlist');
      const btnSolaris = document.getElementById('btnTabSolaris');
      const btnScanner = document.getElementById('btnTabScanner');

      if (btnDelegates) btnDelegates.classList.toggle('tab-active', tabId === 'delegatesTab');
      if (btnWaitlist) btnWaitlist.classList.toggle('tab-active', tabId === 'waitlistTab');
      if (btnSolaris) btnSolaris.classList.toggle('tab-active', tabId === 'solarisTab');
      if (btnScanner) btnScanner.classList.toggle('tab-active', tabId === 'scannerTab');

      const delegatesTab = document.getElementById('delegatesTab');
      const waitlistTab = document.getElementById('waitlistTab');
      const solarisTab = document.getElementById('solarisTab');
      const scannerTab = document.getElementById('scannerTab');

      if (delegatesTab) delegatesTab.style.display = tabId === 'delegatesTab' ? 'block' : 'none';
      if (waitlistTab) waitlistTab.style.display = tabId === 'waitlistTab' ? 'block' : 'none';
      if (solarisTab) solarisTab.style.display = tabId === 'solarisTab' ? 'block' : 'none';
      if (scannerTab) scannerTab.style.display = tabId === 'scannerTab' ? 'block' : 'none';

      if (tabId === 'scannerTab') {
        if (typeof autoDetermineScannerDay === 'function') {
          autoDetermineScannerDay();
        }
        startScanner();
      } else {
        stopScanner();
      }
    };`;

if (adminHtml.includes(oldSwitchTab)) {
  adminHtml = adminHtml.replace(oldSwitchTab, newSwitchTab);
  console.log('Updated switchTab in admin.html');
}

// Fix renderSolarisTable
const oldRenderSolaris = `    // RENDER: SOLARIS DELEGATES
    function renderSolarisTable(list) {
      const solarisTableBody = document.getElementById('solarisTableBody');
      solarisTableBody.innerHTML = "";
      if (list.length === 0) {
        document.getElementById('noSolarisMsg').style.display = 'block';
        return;
      }
      document.getElementById('noSolarisMsg').style.display = 'none';`;

const newRenderSolaris = `    // RENDER: SOLARIS DELEGATES
    function renderSolarisTable(list) {
      const solarisTableBody = document.getElementById('solarisTableBody');
      if (!solarisTableBody) return;
      solarisTableBody.innerHTML = "";
      const noSolarisMsg = document.getElementById('noSolarisMsg');
      if (list.length === 0) {
        if (noSolarisMsg) noSolarisMsg.style.display = 'block';
        return;
      }
      if (noSolarisMsg) noSolarisMsg.style.display = 'none';`;

if (adminHtml.includes(oldRenderSolaris)) {
  adminHtml = adminHtml.replace(oldRenderSolaris, newRenderSolaris);
  console.log('Updated renderSolarisTable in admin.html');
}

// Fix filterSolaris
const oldFilterSolaris = `    window.filterSolaris = function() {
      const query = document.getElementById('searchSolaris').value.trim().toLowerCase();`;

const newFilterSolaris = `    window.filterSolaris = function() {
      const searchSolaris = document.getElementById('searchSolaris');
      if (!searchSolaris) return;
      const query = searchSolaris.value.trim().toLowerCase();`;

if (adminHtml.includes(oldFilterSolaris)) {
  adminHtml = adminHtml.replace(oldFilterSolaris, newFilterSolaris);
  console.log('Updated filterSolaris in admin.html');
}

fs.writeFileSync('admin.html', adminHtml, 'utf8');
console.log('Updated admin.html successfully!');


console.log('\n=== Applying fixes to app/portal/portalScript.js ===');
let portalScriptJs = fs.readFileSync('app/portal/portalScript.js', 'utf8');

const oldAutoLogin = `    // Auto-login from localStorage if session exists
    document.addEventListener('DOMContentLoaded', () => {
      const savedDelegate = localStorage.getItem('resolve_delegate_session');
      if (savedDelegate) {
        try {
          const delegate = JSON.parse(savedDelegate);
          showDashboard(delegate);
        } catch (e) {
          localStorage.removeItem('resolve_delegate_session');
        }
      }
    });`;

const newAutoLogin = `    // Auto-login from localStorage if session exists
    const checkSavedSession = () => {
      const savedDelegate = localStorage.getItem('resolve_delegate_session');
      if (savedDelegate) {
        try {
          const delegate = JSON.parse(savedDelegate);
          showDashboard(delegate);
        } catch (e) {
          localStorage.removeItem('resolve_delegate_session');
        }
      }
    };
    checkSavedSession();`;

if (portalScriptJs.includes(oldAutoLogin)) {
  portalScriptJs = portalScriptJs.replace(oldAutoLogin, newAutoLogin);
  console.log('Updated auto-login in app/portal/portalScript.js');
}

portalScriptJs = portalScriptJs.replace(
  "loginForm.addEventListener('submit', async (e) => {",
  "if (loginForm) loginForm.addEventListener('submit', async (e) => {"
);

fs.writeFileSync('app/portal/portalScript.js', portalScriptJs, 'utf8');
console.log('Updated app/portal/portalScript.js successfully!');
