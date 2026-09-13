const fs = require('fs');
let script = fs.readFileSync('d:/MUN/Resolve_MUN/Website/public/archive-script.js', 'utf8');
if (!script.includes('new Lenis')) {
  const lenisCode = `
// --- LENIS SMOOTH SCROLL ---
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  }
});
`;
  fs.writeFileSync('d:/MUN/Resolve_MUN/Website/public/archive-script.js', script + lenisCode);
  console.log('Added Lenis to archive-script.js');
}
