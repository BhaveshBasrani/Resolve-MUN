async function print500() {
  const res = await fetch('http://localhost:3000');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log(text.slice(0, 1000));
}
print500();
