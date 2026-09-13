const fs = require('fs');

function checkFile(filename) {
  console.log(`=== Checking ${filename} ===`);
  const html = fs.readFileSync(filename, 'utf8');
  const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const fullTag = match[0];
    const scriptTag = fullTag.slice(0, fullTag.indexOf('>') + 1);
    const code = match[1].trim();
    if (scriptTag.includes('application/ld+json')) {
      try {
        JSON.parse(code);
        console.log(`Script ${count} (JSON-LD): OK`);
      } catch (e) {
        console.error(`Script ${count} (JSON-LD) ERROR:`, e.message);
      }
      continue;
    }
    if (!code) {
      console.log(`Script ${count} (External): ${scriptTag}`);
      continue;
    }
    try {
      new Function(code);
      console.log(`Script ${count} (inline, len ${code.length}): JS Syntax OK`);
    } catch (e) {
      console.error(`Script ${count} SYNTAX ERROR:`, e.message);
      console.error(e.stack);
    }
  }
}

checkFile('index.html');
if (fs.existsSync('portal.html')) checkFile('portal.html');
if (fs.existsSync('admin.html')) checkFile('admin.html');
if (fs.existsSync('public/archive-script.js')) {
  console.log('=== Checking public/archive-script.js ===');
  const js = fs.readFileSync('public/archive-script.js', 'utf8');
  try {
    new Function(js);
    console.log('archive-script.js: JS Syntax OK');
  } catch (e) {
    console.error('archive-script.js SYNTAX ERROR:', e.message);
  }
}
