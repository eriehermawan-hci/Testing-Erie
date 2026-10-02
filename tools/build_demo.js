// Membuat planogram_3d_demo.html dari planogram.html + data Excel.
//   - Three.js ditanam di dalam file (bisa dibuka offline)
//   - data hasil impor Excel ditanam sebagai data sampel (kunci penyimpanan terpisah: planogram-v4-demo)
//   - langsung membuka tampilan 3D
//
// Pemakaian (dari folder repo):
//   npm pack three@0.128.0 && tar xzf three-0.128.0.tgz package/build/three.min.js && mv package/build/three.min.js tools/three.min.js
//   node tools/build_demo.js                 # memakai data_planogram_terisi.xlsx
//   DATA_XLSX=file.xlsx node tools/build_demo.js
// Butuh Playwright + Chromium (env PLAYWRIGHT_MODULE bila modul tidak ada di node_modules lokal).
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const THREE_JS = process.env.THREE_JS || path.join(__dirname, 'three.min.js');
const DATA = path.resolve(process.env.DATA_XLSX || path.join(root, 'data_planogram_terisi.xlsx'));
const SRC = path.join(root, 'planogram.html'), OUT = path.join(root, 'planogram_3d_demo.html');
const CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';

(async () => {
  const three = fs.readFileSync(THREE_JS, 'utf8');
  if (three.includes('</script')) throw new Error('three.min.js mengandung </script');
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.route('**/three.min.js', r => r.fulfill({ path: THREE_JS, contentType: 'application/javascript' }));
  await pg.goto('file://' + SRC);
  await pg.setInputFiles('#fileData', DATA); await pg.waitForTimeout(800);
  const state = await pg.evaluate(() => localStorage.getItem('planogram-v4'));
  await b.close();
  if (!state) throw new Error('impor gagal: tidak ada data');
  let h = fs.readFileSync(SRC, 'utf8');
  const sub = (a, c) => { if (!h.includes(a)) throw new Error('pola tidak ditemukan: ' + a.slice(0, 60)); h = h.replace(a, () => c); };
  sub(CDN, '<script>' + three + '</script>');
  sub('let S = (() => { try {', 'const SAMPLE = ' + state + ';\nlet S = (() => { try {');
  sub('return fresh(); })();', 'return Object.assign(fresh(), JSON.parse(JSON.stringify(SAMPLE))); })();');
  sub('\n/* init */\nrender();', '\n/* init */\nrender();\nsetMode(\'3d\');');
  sub('<title>Planogram Generator</title>', '<title>Planogram Generator 3D (sampel)</title>');
  sub("const KEY = 'planogram-v4';", "const KEY = 'planogram-v4-demo';");
  fs.writeFileSync(OUT, h);
  console.log('ditulis:', OUT, (h.length / 1024).toFixed(0) + ' KB');
})();
