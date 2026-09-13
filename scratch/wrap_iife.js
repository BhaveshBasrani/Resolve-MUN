const fs = require('fs');

let code = fs.readFileSync('public/archive-script.js', 'utf8');

// Check if already wrapped
if (code.startsWith('(function() {')) {
  console.log('Already wrapped in IIFE.');
  process.exit(0);
}

const prefix = `(function() {
  if (typeof window !== 'undefined' && window.__archiveScriptInitialized) return;
  if (typeof window !== 'undefined') window.__archiveScriptInitialized = true;

`;

const exportsCode = `

  // EXPOSE ALL INTERACTIVE HANDLERS GLOBALLY ON WINDOW
  if (typeof window !== 'undefined') {
    window.closeCommModal = typeof closeCommModal !== 'undefined' ? closeCommModal : window.closeCommModal;
    window.closeTermsModal = typeof closeTermsModal !== 'undefined' ? closeTermsModal : window.closeTermsModal;
    window.copyDelUPI = typeof copyDelUPI !== 'undefined' ? copyDelUPI : window.copyDelUPI;
    window.copyOcUPI = typeof copyOcUPI !== 'undefined' ? copyOcUPI : window.copyOcUPI;
    window.copyUPI = typeof copyUPI !== 'undefined' ? copyUPI : window.copyUPI;
    window.generateDynamicQR = typeof generateDynamicQR !== 'undefined' ? generateDynamicQR : window.generateDynamicQR;
    window.nextDelStep = typeof nextDelStep !== 'undefined' ? nextDelStep : window.nextDelStep;
    window.nextEbStep = typeof nextEbStep !== 'undefined' ? nextEbStep : window.nextEbStep;
    window.nextOcStep = typeof nextOcStep !== 'undefined' ? nextOcStep : window.nextOcStep;
    window.nextStep = typeof nextStep !== 'undefined' ? nextStep : window.nextStep;
    window.openCommModal = typeof openCommModal !== 'undefined' ? openCommModal : window.openCommModal;
    window.openCommitteeIntro = typeof openCommitteeIntro !== 'undefined' ? openCommitteeIntro : window.openCommitteeIntro;
    window.openDelRegistration = typeof openDelRegistration !== 'undefined' ? openDelRegistration : window.openDelRegistration;
    window.openRegistration = typeof openRegistration !== 'undefined' ? openRegistration : window.openRegistration;
    window.openSelection = typeof openSelection !== 'undefined' ? openSelection : window.openSelection;
    window.openSelectionModal = typeof openSelectionModal !== 'undefined' ? openSelectionModal : (window.openSelection || window.openSelectionModal);
    window.openTermsModal = typeof openTermsModal !== 'undefined' ? openTermsModal : window.openTermsModal;
    window.refreshDelegatePaymentQR = typeof refreshDelegatePaymentQR !== 'undefined' ? refreshDelegatePaymentQR : window.refreshDelegatePaymentQR;
    window.selectPathway = typeof selectPathway !== 'undefined' ? selectPathway : window.selectPathway;
    window.showCustomAlert = typeof showCustomAlert !== 'undefined' ? showCustomAlert : window.showCustomAlert;
    window.updatePortfolioOptions = typeof updatePortfolioOptions !== 'undefined' ? updatePortfolioOptions : window.updatePortfolioOptions;
  }
})();
`;

fs.writeFileSync('public/archive-script.js', prefix + code + exportsCode, 'utf8');
console.log('Successfully wrapped archive-script.js in protected IIFE with window bindings!');
