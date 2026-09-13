async function verify() {
  try {
    const res = await fetch('http://localhost:3000');
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('HTML Length:', text.length);
    console.log('Contains loading-screen:', text.includes('id="loading-screen"'));
    console.log('Contains selectionModal:', text.includes('id="selectionModal"'));
    console.log('Contains delModal:', text.includes('id="delModal"'));
    console.log('Contains ocModal:', text.includes('id="ocModal"'));
    console.log('Contains ebModal:', text.includes('id="ebModal"'));
    console.log('Contains commModal:', text.includes('id="commModal"'));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

verify();
