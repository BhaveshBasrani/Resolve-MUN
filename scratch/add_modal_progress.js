const fs = require('fs');

let content = fs.readFileSync('app/pageContent.js', 'utf8');

const target = `<div class=\\"modal-header\\">\\r\\n      <h2 class=\\"modal-title\\">DELEGATE REGISTRATION</h2>`;
const replacement = `<div class=\\"modal-progress-bar\\"><div class=\\"modal-progress-fill\\" id=\\"regProgressFill\\" style=\\"width: 33.33%;\\"></div></div>\\r\\n    <div class=\\"modal-header\\">\\r\\n      <div class=\\"step-indicator\\" id=\\"regStepBadge\\">Step 01 / 03 · Personal Details</div>\\r\\n      <h2 class=\\"modal-title\\">DELEGATE REGISTRATION</h2>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('app/pageContent.js', content, 'utf8');
  console.log('Added progress bar and step indicator to regModal successfully!');
} else {
  // Try regex for CRLF or LF
  const regex = /<div class=\\"modal-header\\">(\r?\n)\s*<h2 class=\\"modal-title\\">DELEGATE REGISTRATION<\/h2>/;
  if (regex.test(content)) {
    content = content.replace(regex, `<div class=\\"modal-progress-bar\\"><div class=\\"modal-progress-fill\\" id=\\"regProgressFill\\" style=\\"width: 33.33%;\\"></div></div>$1    <div class=\\"modal-header\\">$1      <div class=\\"step-indicator\\" id=\\"regStepBadge\\">Step 01 / 03 · Personal Details</div>$1      <h2 class=\\"modal-title\\">DELEGATE REGISTRATION</h2>`);
    fs.writeFileSync('app/pageContent.js', content, 'utf8');
    console.log('Regex-added progress bar and step indicator to regModal successfully!');
  } else {
    console.error('Target not found in app/pageContent.js!');
  }
}
