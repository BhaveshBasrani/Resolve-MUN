const fs = require('fs');

function auditHtml(filename) {
  console.log(`\n================ AUDITING ${filename} ================`);
  const content = fs.readFileSync(filename, 'utf8');

  // Extract all IDs in HTML
  const idRegex = /id=["']([^"']+)["']/g;
  const ids = new Set();
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    ids.add(m[1]);
  }
  console.log(`Found ${ids.size} unique IDs in HTML markup.`);

  // Extract all getElementById in scripts
  const getElRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
  const referencedIds = new Set();
  const missingIds = new Set();
  while ((m = getElRegex.exec(content)) !== null) {
    const id = m[1];
    referencedIds.add(id);
    if (!ids.has(id)) {
      missingIds.add(id);
    }
  }

  console.log(`Found ${referencedIds.size} referenced IDs via document.getElementById.`);
  if (missingIds.size > 0) {
    console.log(`Non-DOM or guarded IDs referenced by getElementById (${missingIds.size}):`, Array.from(missingIds));
  } else {
    console.log(`All getElementById references have matching DOM elements!`);
  }

  // Check for broken local image/doc links
  const linkRegex = /(?:src|href)=["']([^"']+)["']/g;
  const brokenLinks = [];
  while ((m = linkRegex.exec(content)) !== null) {
    const link = m[1];
    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('javascript:') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('data:')) {
      continue;
    }
    // local path
    const cleanPath = link.split('?')[0].split('#')[0];
    if (!fs.existsSync(cleanPath)) {
      brokenLinks.push(link);
    }
  }
  if (brokenLinks.length > 0) {
    console.warn(`[WARNING] Broken local links/images (${brokenLinks.length}):`, brokenLinks);
  } else {
    console.log(`All local link/image paths exist on disk!`);
  }
}

auditHtml('index.html');
auditHtml('portal.html');
auditHtml('admin.html');
