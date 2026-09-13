const fs = require('fs');

let code = fs.readFileSync('app/pageContent.js', 'utf8');

// Find export const homeHtml = "
const prefix = 'export const homeHtml = "';
const suffix = '";';

if (code.startsWith(prefix) || code.includes(prefix)) {
  const startIdx = code.indexOf(prefix);
  let htmlContent = code.slice(startIdx + prefix.length);
  if (htmlContent.endsWith(suffix)) {
    htmlContent = htmlContent.slice(0, -suffix.length);
  } else {
    // find last quote
    const lastQuote = htmlContent.lastIndexOf('"');
    if (lastQuote !== -1) {
      htmlContent = htmlContent.slice(0, lastQuote);
    }
  }

  // Escape any backticks in htmlContent
  htmlContent = htmlContent.replace(/`/g, '\\`');
  // Escape any ${ in htmlContent
  htmlContent = htmlContent.replace(/\$\{/g, '\\${');

  const newCode = `// Cleaned and optimized pageContent.js\nexport const homeHtml = \`${htmlContent}\`;\n`;
  fs.writeFileSync('app/pageContent.js', newCode, 'utf8');
  console.log('Successfully fixed app/pageContent.js using template literal backticks!');
} else {
  // If it already uses backticks, verify
  console.log('Checking alternative prefix');
  const match = code.match(/export const homeHtml = (["'`])([\s\S]*?)\1;?\s*$/);
  if (match) {
    let body = match[2];
    body = body.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    const newCode = `// Cleaned and optimized pageContent.js\nexport const homeHtml = \`${body}\`;\n`;
    fs.writeFileSync('app/pageContent.js', newCode, 'utf8');
    console.log('Successfully converted via regex match!');
  } else {
    console.log('Could not match prefix directly. Manual rewrite...');
  }
}
