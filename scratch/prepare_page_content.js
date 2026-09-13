const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Ensure committeePrompt exists in index.html if it was missing
let updatedHtml = html;
if (!updatedHtml.includes('id="committeePrompt"')) {
  console.log('Inserting committeePrompt into index.html...');
  const promptMarkup = `
<div aria-hidden="true" class="committee-prompt" id="committeePrompt">
  <div class="committee-prompt__text">
    CHOOSE YOUR COMMITTEE
    <span class="committee-prompt__subtext">Background guides are live</span>
  </div>
</div>
`;
  // Insert after </nav>
  updatedHtml = updatedHtml.replace('</nav>', '</nav>\n' + promptMarkup);
  fs.writeFileSync('index.html', updatedHtml, 'utf8');
  console.log('Updated index.html with committeePrompt!');
}

const bodyStart = updatedHtml.indexOf('<body>');
const scriptStart = updatedHtml.lastIndexOf('<script>');
const bodyContent = updatedHtml.substring(bodyStart + 6, scriptStart).trim();

console.log('Body HTML length:', bodyContent.length);

['selectionModal', 'regModal', 'commModal', 'termsModal', 'ocModal', 'ebModal', 'delModal', 'committeePrompt'].forEach(m => {
  console.log(`Modal/Element ${m}:`, bodyContent.includes(`id="${m}"`));
});

// Now create a module for app/pageContent.js so page.jsx stays clean and maintainable!
const pageContentJs = `// Auto-generated full static HTML content for Resolve MUN
export const homeHtml = ${JSON.stringify(bodyContent)};
`;

fs.writeFileSync('app/pageContent.js', pageContentJs, 'utf8');
console.log('app/pageContent.js written successfully! Size:', pageContentJs.length);
