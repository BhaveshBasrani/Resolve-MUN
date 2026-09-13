async function verifyAllRoutes() {
  const routes = ['/', '/portal', '/admin'];
  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:3000' + r);
      console.log(`Route ${r}: Status ${res.status}`);
      const text = await res.text();
      console.log(`  Length: ${text.length}`);
    } catch (e) {
      console.error(`Route ${r} ERROR:`, e.message);
    }
  }
}
verifyAllRoutes();
