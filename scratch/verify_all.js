async function run() {
  const res = await fetch('http://localhost:3000/archive-script.js');
  const scriptText = await res.text();
  console.log('archive-script.js status:', res.status, 'size:', scriptText.length);
  
  const homeRes = await fetch('http://localhost:3000/');
  const home = await homeRes.text();
  console.log('Homepage status:', homeRes.status, 'size:', home.length);
  console.log('Homepage contains openCommitteeIntro:', home.includes('openCommitteeIntro'));
  console.log('Homepage contains selectionModal:', home.includes('id="selectionModal"'));
  console.log('Homepage contains regModal:', home.includes('id="regModal"'));
  console.log('Homepage contains commModal:', home.includes('id="commModal"'));
  console.log('Homepage contains about section:', home.includes('id="about"'));
  console.log('Homepage contains letter section:', home.includes('id="letter"'));
  console.log('Homepage contains committees section:', home.includes('id="committees"'));
  console.log('Homepage contains venue section:', home.includes('id="venue"'));
  console.log('Homepage contains secretariat section:', home.includes('id="secretariat"'));
  console.log('Homepage contains countdown:', home.includes('id="countdown"'));
  console.log('Homepage contains hero:', home.includes('id="hero"'));
}
run();
