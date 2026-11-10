const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, outDir = process.argv[2];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); } });
}).listen(0, async () => {
  const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  pg.on('pageerror', e => console.log('ERR', e.message));
  let skus = Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'products.json')))); if (process.argv[3]) skus = process.argv[3].split(',');
  fs.mkdirSync(outDir, { recursive: true });
  for (const s of skus) {
    await pg.goto(`http://localhost:${port}/render.html?sku=${s}`);
    await pg.waitForFunction('window.__done', null, { timeout: 120000 });
    await pg.locator('#c').screenshot({ path: path.join(outDir, `${s}.png`) });
    console.log('ok', s);
  }
  await b.close(); srv.close();
});
