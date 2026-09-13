const fs = require('fs');

let content = fs.readFileSync('app/pageContent.js', 'utf8');

// Target the committees section tag with background image
const regex = /<section id=\\"committees\\" class=\\"reveal\\" style=\\"[^\\"]*\\">/;

if (regex.test(content)) {
  content = content.replace(regex, '<section id=\\"committees\\" class=\\"reveal\\">');
  fs.writeFileSync('app/pageContent.js', content, 'utf8');
  console.log('Successfully removed background image style from #committees in app/pageContent.js');
} else {
  // Try unescaped regex just in case
  const unescapedRegex = /<section id="committees" class="reveal" style="[^"]*">/;
  if (unescapedRegex.test(content)) {
    content = content.replace(unescapedRegex, '<section id="committees" class="reveal">');
    fs.writeFileSync('app/pageContent.js', content, 'utf8');
    console.log('Successfully removed unescaped background image style from #committees in app/pageContent.js');
  } else {
    console.error('Could not match #committees section with style attribute!');
  }
}
