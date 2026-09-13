const fs = require('fs');
const js = fs.readFileSync('public/archive-script.js', 'utf8');
const needed = [
  'closeCommModal', 'closeTermsModal', 'copyDelUPI', 'copyOcUPI', 'copyUPI',
  'generateDynamicQR', 'nextDelStep', 'nextEbStep', 'nextOcStep', 'nextStep',
  'openCommModal', 'openCommitteeIntro', 'openDelRegistration', 'openRegistration',
  'openSelection', 'openSelectionModal', 'openTermsModal', 'refreshDelegatePaymentQR',
  'selectPathway', 'showCustomAlert', 'updatePortfolioOptions'
];
needed.forEach(n => {
  const isAttached = js.includes('window.' + n + ' =') || js.includes('window["' + n + '"] =') || js.includes("window['" + n + "'] =");
  const isDeclared = js.includes('function ' + n);
  console.log(n + ':', isAttached ? 'EXPOSED ON WINDOW' : (isDeclared ? 'DECLARED BUT NOT ON WINDOW' : 'MISSING'));
});
