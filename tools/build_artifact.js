// Membuat versi Artifact (halaman yang dihosting di claude.ai) dari planogram.html + data Excel.
// Perbedaan dari build_demo.js, karena frame Artifact membatasi:
//   - tanpa <!doctype>/<html>/<head>/<body> (dibungkus otomatis saat publish)
//   - Three.js dimuat dari cdnjs (diizinkan), bukan ditanam
//   - tombol yang butuh unduhan / cetak disembunyikan (diblokir frame): Template CSV, Ekspor PNG/CSV, Cetak,
//     Simpan/Buka .json, Ekspor PNG 3D. Impor Excel (input berkas) tetap berfungsi.
//   - gambar produk dari ruparupa diblokir CSP, jadi kartu memakai placeholder berwarna bernama produk
// Pemakaian: lihat build_demo.js (butuh tools/three.min.js hanya untuk proses impor di Chromium).
//   OUT_ARTIFACT=/path/planogram_artifact.html node tools/build_artifact.js
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const THREE_JS = process.env.THREE_JS || path.join(__dirname, 'three.min.js');
const DATA = path.resolve(process.env.DATA_XLSX || path.join(root, 'data_planogram_terisi.xlsx'));
const SRC = path.join(root, 'planogram.html');
const OUT = path.resolve(process.env.OUT_ARTIFACT || path.join(root, 'planogram_artifact.html'));

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.route('**/three.min.js', r => r.fulfill({ path: THREE_JS, contentType: 'application/javascript' }));
  await pg.goto('file://' + SRC);
  await pg.setInputFiles('#fileData', DATA); await pg.waitForTimeout(800);
  const state = await pg.evaluate(() => localStorage.getItem('planogram-v4'));
  await b.close();
  if (!state) throw new Error('impor gagal: tidak ada data');
  let h = fs.readFileSync(SRC, 'utf8');
  const sub = (a, c) => { if (!h.includes(a)) throw new Error('pola tidak ditemukan: ' + a.slice(0, 60)); h = h.replace(a, () => c); };
  // buang kerangka dokumen (dipasang platform)
  sub('<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n', '');
  sub('</head>\n<body>', '');
  sub('</body>\n</html>', '');
  // data sampel tertanam + kunci penyimpanan khusus artifact + mulai di 3D
  sub('let S = (() => { try {', 'const SAMPLE = ' + state + ';\nlet S = (() => { try {');
  sub('return fresh(); })();', 'return Object.assign(fresh(), JSON.parse(JSON.stringify(SAMPLE))); })();');
  sub('\n/* init */\nrender();', '\n/* init */\nif (!ready()) { const a0 = S.plans.flatMap(p => p.zones.flatMap(z => z.items)).map(c => (S.skus[c] || {}).adj).find(Boolean); if (a0) F.adj = a0; }   // pratinjau langsung menampilkan data mockup\nrender();\nsetMode(\'3d\');');
  sub("const KEY = 'planogram-v4';", "const KEY = 'planogram-v4-artifact-" + require('crypto').createHash('md5').update(state).digest('hex').slice(0, 8) + "';");
  // tombol yang tidak bisa berfungsi di frame artifact
  for (const id of ['btnTpl', 'btnUrl', 'btnPng', 'btnCsv', 'btnPrint', 'btnSave', 'btnLoad', 'gl3png']) sub(`<button id="${id}"`, `<button hidden id="${id}"`);
  fs.writeFileSync(OUT, h);
  console.log('ditulis:', OUT, (h.length / 1024).toFixed(0) + ' KB');
})();
