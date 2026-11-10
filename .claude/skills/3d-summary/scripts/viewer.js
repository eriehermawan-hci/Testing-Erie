/* ===== Preview racking: susun SKU di fixture (logika Planogram Generator) ===== */
const DATA = /*DATA*/null;
setClearMode('lite');

const $ = s => document.querySelector(s);
const nf = n => Math.round(n).toLocaleString('id-ID');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- template tiap SKU (dinormalkan: alas di y=0, titik tengah di x/z=0) ---------- */
const TPL = {};
for (const [k, s] of Object.entries(DATA.skus)) {
  const g = makeSku(s.cfg), b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3());
  g.position.set(-c.x, -b.min.y, -c.z);
  const piv = new THREE.Group(); piv.add(g);
  const mats = []; piv.traverse(o => { if (o.isMesh && !mats.includes(o.material)) mats.push(o.material); });
  TPL[k] = { piv, mats, w: b.max.x - b.min.x, d: b.max.z - b.min.z, h: b.max.y - b.min.y };
}

/* ---------- unit tampilan: tray PDQ dan kotak packing (foto produk di sisi depan) ---------- */
const BOX = {}, TRAY = {}, LINEMATS = [];
const BOXLINE = new LineMaterial({ color: 0x1b2230, linewidth: 2.2 }), TRAYLINE = new LineMaterial({ color: 0x77726a, linewidth: 1.3 });
const GUIDELINE = new LineMaterial({ color: 0xd04b4b, linewidth: 1.6, dashed: true, dashSize: 3, gapSize: 2.5 });
LINEMATS.push(BOXLINE, TRAYLINE, GUIDELINE);
function outline(mesh, lm) { const lg = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(mesh.geometry, 20)); mesh.add(new LineSegments2(lg, lm)); }
const STEP = 0.35, LSTEP = 0.25, OGAP = 0.5;   // OGAP: jarak antar produk pada Display only            // jarak kecil antar kotak supaya tiap pcs terlihat terpisah
const stdM = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
function makeBox(k) {
  const b = DATA.skus[k].box, side = stdM(0xd9d0bd), front = stdM(0xffffff, 0.55);
  const img = new Image();
  img.onload = () => {
    const cw = 512, ch = Math.max(64, Math.round(512 * b.h / b.w)), c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch); g.strokeStyle = '#d6d0c4'; g.lineWidth = 6; g.strokeRect(3, 3, cw - 6, ch - 6);
    const sc = Math.min(cw * 0.92 / img.width, ch * 0.92 / img.height); g.drawImage(img, (cw - img.width * sc) / 2, (ch - img.height * sc) / 2, img.width * sc, img.height * sc);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; front.map = t; front.needsUpdate = true; if (window.__ready) draw(); else window.__texPending = (window.__texPending || 0) - 1;
  };
  window.__texPending = (window.__texPending || 0) + 1; img.src = b.img;
  const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), [side, side, side, side, front, side]);
  m.position.y = b.h / 2; m.castShadow = true; m.receiveShadow = true; outline(m, BOXLINE);
  const piv = new THREE.Group(); piv.add(m);
  return { piv, mats: [side, front], w: b.w, d: b.d, h: b.h };
}
function makeTray(k) {
  const s = DATA.skus[k], P = s.pdq, t = TPL[k], inc = s.stack ? s.stack.inc : 0;
  const cw = t.w + 0.6, cd = t.d + 0.6, mg = 0.5, wt = 0.35, base = 0.3;
  const iw = P.gx * cw + 2 * mg, id = P.gy * cd + 2 * mg, ih = t.h + (P.s - 1) * inc, wallH = Math.min(8, Math.max(3, 0.4 * ih));
  const mat = stdM(0xf2f0ea, 0.9), piv = new THREE.Group(), W2 = iw + 2 * wt, D2 = id + 2 * wt;
  const add = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; outline(m, TRAYLINE); piv.add(m); };
  add(W2, base, D2, 0, base / 2, 0);
  add(W2, wallH, wt, 0, base + wallH / 2, D2 / 2 - wt / 2); add(W2, wallH, wt, 0, base + wallH / 2, -D2 / 2 + wt / 2);
  add(wt, wallH, D2, W2 / 2 - wt / 2, base + wallH / 2, 0); add(wt, wallH, D2, -W2 / 2 + wt / 2, base + wallH / 2, 0);
  for (let i = 0; i < P.gx; i++) for (let j = 0; j < P.gy; j++) for (let u = 0; u < P.s; u++) { const c = t.piv.clone(true); c.position.set(-iw / 2 + mg + cw * (i + 0.5), base + u * inc, -id / 2 + mg + cd * (j + 0.5)); piv.add(c); }
  return { piv, mats: [mat], w: W2, d: D2, h: base + ih, pitch: base + ih + 0.2 };
}
for (const [k, s] of Object.entries(DATA.skus)) {
  if (s.mode === 'pack') { BOX[k] = makeBox(k); BOX[k].mats.forEach(m => TPL[k].mats.push(m)); }
  if (s.mode === 'pdq') { TRAY[k] = makeTray(k); TRAY[k].mats.forEach(m => TPL[k].mats.push(m)); }
}

/* ---------- scene ---------- */
const stage = $('#stage'), cv = $('#cv'), labelsEl = $('#labels');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;
scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e6e6, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 1.25); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; key.shadow.radius = 4; key.shadow.intensity = 0.55;
scene.add(key, key.target);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: 0.17 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const camera = new THREE.PerspectiveCamera(28, 1, 5, 4000);
const controls = new OrbitControls(camera, cv); controls.enableDamping = false; controls.maxPolarAngle = Math.PI * 0.52; controls.addEventListener('change', draw); controls.addEventListener('start', () => { moved = true; });

/* ---------- bahan rak (ash dari MATS Planogram Generator, panel belakang diputihkan) ---------- */
const ASH = { b: 0xcdae78, u: 0xcfb687, base: 0xb8955e, pallet: 0xb98d55 };
const std = (c, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
function canvasTex(w, h, fn, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t;
}
function box(w, h, d, mat, x, y, z, shadow = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; return m; }
function textPlane(text, w, h, fg, bg) {
  const t = canvasTex(1024, Math.round(1024 * h / w), (g, cw, ch) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); } g.fillStyle = fg; g.font = `600 ${ch * 0.52}px "IBM Plex Sans", system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, cw / 2, ch / 2 + ch * 0.03); });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
}

/* ---------- aturan susun ---------- */
const LIP = 1.0, BOARD = 2.5, BASE = 10;
const TRAY_MAX = DATA.trayMax || 10;
function packShelf(sh, W, D, C) {
  const rep = sh.items.map(it => {
    const s = DATA.skus[it.k], t = TPL[it.k];
    const r = { k: it.k, qd: it.qd, nm: s.nm, pr: s.pr, mode: s.mode, dw: s.dw, h: t.h, placed: 0, capPcs: 0, cols: 0, rows: 0, n: 1, rot: false, flag: '', unitPcs: 1, inc: 0, tp: t, need: 0, extra: 0 };
    if (s.mode === 'pack') {                                   // 1 unit terbuka di depan, kotak packing di belakangnya
      const bx = BOX[it.k]; r.h = Math.max(t.h, bx.h);
      if (r.h > C + 0.01) { r.flag = 'tinggi'; return r; }
      if (D < t.d - 0.01) { r.flag = 'dalam'; return r; }
      const L = Math.max(1, Math.floor((C + LSTEP) / (bx.h + LSTEP))), kmax = Math.max(0, Math.floor((D - t.d + STEP) / (bx.d + STEP))), cap = 1 + kmax * L;
      Object.assign(r, { fw: Math.max(t.w, bx.w) + STEP, fd: D, L, kmax, cap, need: Math.ceil(it.qd / cap), bx });
      return r;
    }
    let tp = t, qdU = it.qd, maxStack = s.stack ? s.stack.max : 1;
    r.inc = s.stack ? s.stack.inc : 0;
    if (s.mode === 'pdq') { tp = TRAY[it.k]; r.unitPcs = s.pdq.n; qdU = Math.ceil(it.qd / s.pdq.n); r.inc = tp.pitch; maxStack = TRAY_MAX; }
    r.tp = tp; r.h = tp.h;
    if (tp.h > C + 0.01) { r.flag = 'tinggi'; return r; }
    r.n = r.inc > 0 ? Math.max(1, Math.min(maxStack, 1 + Math.floor((C - tp.h) / r.inc))) : 1;
    let best = null;
    const gw = s.mode === 'open' ? OGAP : 0;
    for (const rot of [false, true]) {
      const fwA = rot ? tp.d : tp.w, fdA = rot ? tp.w : tp.d, fw = fwA + gw, rows = Math.floor((D + gw) / (fdA + gw));
      if (rows < 1) continue;
      const need = Math.ceil(Math.ceil(qdU / r.n) / rows), wn = need * fw;
      if (!best || wn < best.wn - 0.01) best = { rot, fw, fdA, rows, need, wn };
    }
    if (!best) { r.flag = 'dalam'; return r; }
    Object.assign(r, { rot: best.rot, fw: best.fw, fdA: best.fdA, rows: best.rows, need: best.need });
    return r;
  });
  const capPcs = r => r.mode === 'pack' ? r.cols * r.cap : r.cols * r.rows * r.n * r.unitPcs;
  const wNeed = rep.filter(r => r.fw).reduce((a, r) => a + r.need * r.fw, 0);       // lebar yang dibutuhkan agar qty sheet muat
  const ok = rep.filter(r => !r.flag);
  let used = 0; for (const r of ok) { if (used + r.fw <= W + 0.01) { r.cols = 1; used += r.fw; } else r.flag = 'lebar'; }
  for (;;) {                                                  // 1) penuhi qty sheet dulu (yang paling kurang didahulukan)
    let pick = null, rem = W - used;
    for (const r of ok) { if (!r.cols || r.cols >= r.need || r.fw > rem + 0.01) continue; const un = 1 - capPcs(r) / r.qd; if (!pick || un > pick.un) pick = { r, un }; }
    if (!pick) break; pick.r.cols++; used += pick.r.fw;
  }
  for (let g = 0; g < 400; g++) {                             // 2) isi sisa lebar: gandakan SKU bergiliran sampai shelving penuh
    let added = false;
    for (const r of ok) { if (r.cols && r.fw <= W - used + 0.01) { r.cols++; used += r.fw; added = true; } }
    if (!added) break;
  }
  for (const r of ok) {
    if (!r.cols) continue;
    r.extra = Math.max(0, r.cols - r.need); r.capPcs = capPcs(r);
    if (r.mode === 'pack') { const base = r.cols * (1 + r.kmax); r.disp = Math.min(r.cols * r.cap, Math.max(r.qd, base)); }
    else { const slots = r.cols * r.rows, un = Math.ceil(r.qd / r.unitPcs); r.dispUnits = Math.min(slots * r.n, Math.max(un, slots)); r.disp = r.dispUnits * r.unitPcs; }
    r.placed = r.disp;
  }
  const m = ok.filter(r => r.cols).length, gap = m ? (W - used) / (m + 1) : 0;
  let x = -W / 2 + gap;
  for (const r of ok) if (r.cols) { r.x0 = x; x += r.cols * r.fw + gap; }
  rep.forEach(r => { if (!r.flag) r.flag = r.capPcs >= r.qd ? 'cukup' : 'kurang'; });
  return { rep, used, wNeed };
}

/* ---------- laporan kecocokan qty sheet dengan shelving (dipakai untuk Excel feedback) ---------- */
function bandsOf(fx) {
  if (fx.kind === 'pallet') return [{ top: 12, clear: fx.size.h - 12, h: fx.size.h - 12 }];
  const hs = fx.zones, bands = []; let y = BASE;
  for (let i = hs.length - 1; i >= 0; i--) { bands[i] = { h: hs[i], top: y + BOARD, clear: hs[i] - BOARD }; y += hs[i]; }
  return bands;
}
window.__report = () => DATA.fixtures.map(fx => {
  const bands = bandsOf(fx), W = fx.size.w, D = fx.size.d - (fx.kind === 'wall' ? LIP : 0);
  return { id: fx.id, title: fx.title, xl: fx.xl, kind: fx.kind, W, D, shelves: fx.shelves.map((sh, si) => {
    const { rep, used, wNeed } = packShelf(sh, W, D, bands[si].clear);
    return { code: sh.code, no: si, media: !!sh.media, clear: bands[si].clear, used, wNeed, qty: sh.items.reduce((a, b) => a + b.qd, 0),
      items: rep.map(r => ({ k: r.k, nm: r.nm, pr: r.pr, mode: r.mode, dw: r.dw, qd: r.qd, flag: r.flag, fw: r.fw || 0, cols: r.cols, need: r.need, extra: r.extra, rows: r.rows || r.kmax || 0, n: r.n || r.L || 1, unitPcs: r.unitPcs, h: r.h, disp: r.disp || 0, cap: r.capPcs || 0 })) };
  }) };
});

/* ---------- membangun fixture ---------- */
let group = null, cur = 0, labels = [];
function buildWall(fx, g) {
  const { w: W, d: D, h: H } = fx.size, UP = 3.4, hs = fx.zones, sum = hs.reduce((a, b) => a + b, 0);
  g.add(box(W + UP * 2, BASE, D, std(ASH.base), 0, BASE / 2, 0));
  const groove = canvasTex(8, 75, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(0, h - 3, w, 3); }, [1, (H - BASE) / 7.5]);
  g.add(box(W, H - BASE, 1.2, new THREE.MeshStandardMaterial({ color: 0xffffff, map: groove, roughness: 0.9 }), 0, BASE + (H - BASE) / 2, -D / 2 + 0.6));
  const dots = canvasTex(34, 50, (c, w, h) => { c.fillStyle = '#dcc59c'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(w / 2, h / 2, 3, 0, 7); c.fill(); }, [1, (H - BASE) / 5]);
  for (const sx of [-1, 1]) g.add(box(UP, H - BASE, 6, new THREE.MeshStandardMaterial({ color: 0xffffff, map: dots, roughness: 0.7 }), sx * (W / 2 + UP / 2), BASE + (H - BASE) / 2, -D / 2 + 3));
  const head = box(W + UP * 2, 7.5, 6, std(ASH.u), 0, H + 3.75, -D / 2 + 3); g.add(head);
  const sign = textPlane(fx.label, 70, 5, '#4a3a22'); sign.position.set(0, H + 3.75, -D / 2 + 6.05); g.add(sign);
  let y = BASE; const bands = [];
  for (let i = hs.length - 1; i >= 0; i--) { bands[i] = { yb: y, h: hs[i] }; y += hs[i]; }
  bands.forEach((b, i) => {
    g.add(box(W, BOARD, D, std(ASH.b, 0.65), 0, b.yb + BOARD / 2, 0));
    g.add(box(W, 2, LIP, std(0xffffff, 0.5), 0, b.yb + BOARD + 1, D / 2 - LIP / 2));
    b.top = b.yb + BOARD; b.clear = b.h - BOARD;
  });
  return { bands, W, D, H: H + 7.5 };
}
function buildPallet(fx, g) {
  const { w: W, d: D, h: H } = fx.size, wood = std(ASH.pallet, 0.8), dark = std(0xa9804d, 0.85);
  for (let i = 0; i < 7; i++) g.add(box(W, 1.8, 11.5, wood, 0, 10.2 + 0.9, -D / 2 + 5.75 + i * ((D - 11.5) / 6)));
  for (const x of [-W / 2 + 6, 0, W / 2 - 6]) for (const z of [-D / 2 + 6, 0, D / 2 - 6]) g.add(box(12, 8.4, 12, dark, x, 1.8 + 4.2, z));
  for (const x of [-W / 2 + 6, 0, W / 2 - 6]) g.add(box(12, 1.8, D, wood, x, 0.9, 0));
  const hw = W / 2 + 3, hd = D / 2 + 3, ls = new LineSegments2(new LineSegmentsGeometry().setPositions([-hw, H, -hd, hw, H, -hd, hw, H, -hd, hw, H, hd, hw, H, hd, -hw, H, hd, -hw, H, hd, -hw, H, -hd]), GUIDELINE); ls.computeLineDistances(); g.add(ls);
  return { bands: [{ top: 12, clear: H - 12, h: H - 12 }], W, D, H };
}
function place(fx, geo, g) {
  const reps = [];
  const put = (tpl, x, y, z, ry) => { const c = tpl.piv.clone(true); c.position.set(x, y, z); if (ry) c.rotation.y = ry; c.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); g.add(c); };
  fx.shelves.forEach((sh, si) => {
    const band = geo.bands[si], lip = fx.kind === 'wall' ? LIP : 0, D = geo.D - lip;
    const { rep, used, wNeed } = packShelf(sh, geo.W, D, band.clear), zFront = geo.D / 2 - lip;
    rep.forEach(r => {
      if (!r.placed) return;
      if (r.mode === 'pack') {                                  // tiap kolom: 1 unit terbuka di depan, kotak di belakang (isi kedalaman dulu, baru tumpuk)
        const o = TPL[r.k], bx = r.bx;
        for (let c = 0; c < r.cols; c++) {
          const u = Math.floor(r.disp / r.cols) + (c < r.disp % r.cols ? 1 : 0), x = r.x0 + c * r.fw + r.fw / 2;
          put(o, x, band.top, zFront - o.d / 2, 0);
          const gapEq = r.kmax ? (D - o.d - r.kmax * bx.d) / r.kmax : 0;      // sisa kedalaman dibagi rata, kotak terakhir menempel ke belakang
          for (let j = 0; j < u - 1; j++) { const row = r.kmax ? j % r.kmax : 0, layer = r.kmax ? Math.floor(j / r.kmax) : 0; put(bx, x, band.top + layer * (bx.h + LSTEP), zFront - o.d - gapEq * (row + 1) - row * bx.d - bx.d / 2, 0); }
        }
        return;
      }
      const slots = r.cols * r.rows;
      for (let s = 0; s < slots; s++) {
        const row = Math.floor(s / r.cols), col = s % r.cols, cnt = Math.floor(r.dispUnits / slots) + (s < r.dispUnits % slots ? 1 : 0);
        const stepZ = r.rows > 1 ? (D - r.fdA) / (r.rows - 1) : 0;          // baris merata sampai belakang shelving
        const x = r.x0 + col * r.fw + r.fw / 2, z = zFront - r.fdA / 2 - row * stepZ;
        for (let u = 0; u < cnt; u++) put(r.tp, x, band.top + u * r.inc, z, r.rot ? Math.PI / 2 : 0);
      }
    });
    if (fx.kind === 'wall' && !sh.items.length) { const p = textPlane(sh.media ? 'MEDIA KOMUNIKASI' : 'S T O C K', sh.media ? 80 : 60, 7, 'rgba(40,50,66,.55)'); p.position.set(0, band.top + Math.min(band.clear, 32) / 2, -geo.D / 2 + 1.3); g.add(p); }
    reps.push({ code: sh.code, media: !!sh.media, band, rep, used, wNeed, qty: sh.items.reduce((a, b) => a + b.qd, 0) });
  });
  return reps;
}

function frame(view, geo) {
  const fov = camera.fov * Math.PI / 180, asp = camera.aspect, L = Math.max(geo.W, geo.H);
  let dist, ty;
  if (geo.fit) {                                    // pallet: pas ke ukuran isi sebenarnya
    const fh = 2 * Math.atan(Math.tan(fov / 2) * asp), fe = Math.min(fov, fh);
    dist = geo.fit.r / Math.sin(fe / 2) * 0.98; ty = geo.fit.cy;
  } else {
    const dH = (geo.H * 1.1 / 2) / Math.tan(fov / 2), dW = (geo.W * 1.5 / 2) / (Math.tan(fov / 2) * asp); dist = Math.max(dH, dW) + geo.D; ty = geo.H * 0.5;
  }
  controls.target.set(0, ty, 0);
  const el = view === 'front' ? (geo.fit ? 0.32 : 0.05) : (geo.fit ? 0.5 : 0.2), az = view === 'front' ? 0 : 0.62;
  camera.position.set(Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
  camera.lookAt(controls.target); controls.update();
  key.position.set(-L * 0.55, geo.H * 1.1, L * 0.9); key.target.position.set(0, geo.H * 0.45, 0);
  const sc = key.shadow.camera; sc.left = -L * 0.8; sc.right = L * 0.8; sc.top = L * 0.8; sc.bottom = -L * 0.8; sc.near = 1; sc.far = L * 4; sc.updateProjectionMatrix();
}

function draw() { renderer.render(scene, camera); updateLabels(); }
function updateLabels() {
  const w = stage.clientWidth, h = stage.clientHeight;
  labels.forEach(l => { const v = l.pos.clone().project(camera), x = Math.max((v.x * 0.5 + 0.5) * w, l.el.offsetWidth + 8); l.el.style.transform = `translate(${x}px,${(-v.y * 0.5 + 0.5) * h}px) translate(-100%,-50%)`; l.el.style.opacity = v.z < 1 ? 1 : 0; });
}
function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); LINEMATS.forEach(m => m.resolution.set(w, h)); camera.aspect = w / h; camera.updateProjectionMatrix(); draw(); }

let view = 'front', geoCur = null, repsCur = null, moved = false;
function show(i) {
  cur = i; const fx = DATA.fixtures[i];
  if (group) { scene.remove(group); group.traverse(o => { if (o.isMesh && o.geometry && !o.userData.shared) { /* geometri model dipakai bersama; hanya rak yang dibuang */ } }); }
  group = new THREE.Group(); scene.add(group);
  geoCur = fx.kind === 'wall' ? buildWall(fx, group) : buildPallet(fx, group);
  repsCur = place(fx, geoCur, group);
  if (fx.kind === 'pallet') { const bb = new THREE.Box3().setFromObject(group), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3()); geoCur.fit = { r: sz.length() / 2, cy: c.y }; geoCur.H = sz.y; }
  labelsEl.innerHTML = ''; labels = [];
  repsCur.forEach((r, si) => {
    const el = document.createElement('div'); el.className = 'lab'; const pl = r.rep.reduce((a, b) => a + b.placed, 0);
    el.innerHTML = fx.kind === 'wall' ? `<b>Shelving ${si}</b><span>${r.media ? 'Media Komunikasi' : r.code + ' · ' + (r.qty ? nf(r.qty) + ' pcs' : 'stock')}</span>` : `<b>${esc(fx.label)}</b><span>${r.code} · ${nf(r.qty)} pcs</span>`;
    labelsEl.appendChild(el);
    labels.push({ el, pos: new THREE.Vector3(-geoCur.W / 2 - (fx.kind === 'wall' ? 6 : 4), r.band.top + Math.min(r.band.clear, 40) / 2, geoCur.D / 2) });
  });
  if (fx.kind === 'pallet') { const el = document.createElement('div'); el.className = 'lab lim'; el.innerHTML = `<b>Batas display ${fx.size.h} cm</b><span>dari dasar pallet, untuk stock</span>`; labelsEl.appendChild(el); labels.push({ el, pos: new THREE.Vector3(-geoCur.W / 2 - 4, fx.size.h, geoCur.D / 2 + 3) }); }
  moved = false; resize(); frame(view, geoCur); renderer.shadowMap.needsUpdate = true; draw(); renderPanel(fx); setTabs();
}

/* ---------- panel keterangan ---------- */
function modeNote(x, r) {
  const s = DATA.skus[x.k], tag = { open: 'Display only', pack: 'Display + packing', pdq: 'PDQ ' + (s.pdq ? s.pdq.n : '') }[x.mode];
  if (x.flag === 'tinggi') return `${tag} · tinggi ${x.h.toFixed(1)} cm melebihi tinggi bebas ${r.band.clear.toFixed(1)} cm`;
  if (x.flag === 'lebar') return `${tag} · lebar rak habis${x.mode === 'pdq' ? `, tray ${x.tp.w.toFixed(0)} cm` : ''}, SKU ini tidak kebagian tempat`;
  if (x.flag === 'dalam') return `${tag} · lebih dalam dari rak (${geoCur.D} cm)`;
  const ex = x.extra ? ` · +${x.extra} facing tambahan agar shelving penuh` : '', cap = ` · kapasitas maks ${nf(x.capPcs)} pcs`;
  if (x.mode === 'pack') return `${tag} · ${x.cols} kolom: 1 unit terbuka di depan + kotak packing di belakang${s.box.flat ? ' (flat pack berdiri menghadap depan)' : ''}${ex}${cap}`;
  if (x.mode === 'pdq') { const P = s.pdq, tr = Math.ceil(x.placed / P.n); return `${tag} · ${tr} tray × ${P.n} pcs (${P.gx}×${P.gy}${P.s > 1 ? ', tumpuk ' + P.s : ''})${x.n > 1 ? ', tray ditumpuk sampai ' + x.n : ''}${ex}${cap}`; }
  return `${tag}${x.n > 1 ? ' · ditumpuk sampai ' + x.n + ' unit' : ''}${ex}${cap}`;
}

const STATUS = { cukup: ['Cukup', 'ok'], kurang: ['Kurang', 'warn'], tinggi: ['Terlalu tinggi', 'bad'], lebar: ['Tidak muat', 'bad'], dalam: ['Terlalu dalam', 'bad'] };
function renderPanel(fx) {
  const tot = repsCur.reduce((a, r) => a + r.qty, 0), pl = repsCur.reduce((a, r) => a + r.rep.reduce((x, y) => x + y.placed, 0), 0), ok = repsCur.reduce((a, r) => a + r.rep.reduce((x, y) => x + Math.min(y.qd, y.capPcs), 0), 0);
  $('#sum').innerHTML = `<div><span>Qty sheet</span><b>${nf(tot)}</b><i>pcs</i></div><div><span>Tampil (shelving penuh)</span><b>${nf(pl)}</b><i>pcs</i></div><div><span>Qty sheet terpenuhi</span><b>${tot ? Math.round(ok / tot * 100) : 0}%</b><i>muat di rak</i></div>`;
  $('#ttl').textContent = fx.title; $('#dim').textContent = `${fx.size.w} × ${fx.size.d} × ${fx.size.h} cm` + (fx.kind === 'wall' ? ' · 6 shelving (0–5) · jarak antarshelving 45 cm' : ' · batas tinggi display 120 cm dari dasar pallet');
  $('#shelves').innerHTML = repsCur.map((r, si) => {
    const p = r.rep.reduce((a, b) => a + b.placed, 0);
    const head = fx.kind === 'wall' ? `Shelving ${si} <i>${r.code}</i>` : `Pallet <i>${r.code}</i>`;
    if (!r.rep.length) return `<section class="sh"><header><h3>${head}</h3><span class="mut">${r.media ? 'Kosong · Media Komunikasi' : 'Kosong · area STOCK'}</span></header></section>`;
    return `<section class="sh"><header><h3>${head}</h3><span class="mut">tampil ${nf(p)} · sheet ${nf(r.qty)} pcs</span></header>
      <div class="bar" role="img" aria-label="Lebar terpakai ${Math.round(r.used / geoCur.W * 100)}%"><u style="width:${Math.min(100, r.used / geoCur.W * 100)}%"></u></div>
      <p class="clr">Tinggi bebas ${r.band.clear.toFixed(1)} cm · lebar terpakai ${r.used.toFixed(0)} dari ${geoCur.W} cm · lebar yang dibutuhkan qty sheet ${r.wNeed.toFixed(0)} cm</p>
      <ul>${r.rep.map(x => { const st = STATUS[x.flag]; return `<li data-k="${x.k}"><code>${x.k}</code><span class="nm">${esc(x.nm)}</span><span class="q">${nf(x.placed)}<small> / ${nf(x.qd)}</small></span><em class="chip ${st[1]}">${st[0]}</em><p class="note">${esc(modeNote(x, r))}</p></li>`; }).join('')}</ul></section>`;
  }).join('');
  document.querySelectorAll('#shelves li').forEach(li => { const k = li.dataset.k; li.addEventListener('mouseenter', () => hi(k, true)); li.addEventListener('mouseleave', () => hi(k, false)); li.addEventListener('focusin', () => hi(k, true)); li.addEventListener('focusout', () => hi(k, false)); li.tabIndex = 0; });
}
function hi(k, on) { TPL[k].mats.forEach(m => { if (m.emissive) { m.emissive.set(on ? 0x2a86ff : 0x000000); m.emissiveIntensity = on ? 0.55 : 0; } }); draw(); }

/* ---------- kontrol ---------- */
const groups = [];
DATA.fixtures.forEach((f, i) => { const gid = f.group || f.id; let G = groups.find(x => x.id === gid); if (!G) groups.push(G = { id: gid, tab: f.tab, idx: [] }); G.idx.push(i); });
function setTabs() {
  const g = groups.find(x => x.idx.includes(cur)), o = $('#opts');
  document.querySelectorAll('[data-grp]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.grp === g.id)));
  o.hidden = g.idx.length < 2;
  o.innerHTML = g.idx.length < 2 ? '' : '<span class="eyebrow">Opsi tampilan</span>' + g.idx.map(i => `<button data-fx="${i}" aria-pressed="${i === cur}">${esc(DATA.fixtures[i].opt)}</button>`).join('');
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
}
$('#tabs').innerHTML = groups.map(g => `<button role="tab" data-grp="${g.id}" aria-selected="false">${esc(g.tab)}</button>`).join('');
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-grp]'); if (b) location.hash = DATA.fixtures[groups.find(x => x.id === b.dataset.grp).idx[0]].id; });
$('#opts').addEventListener('click', e => { const b = e.target.closest('[data-fx]'); if (b) location.hash = DATA.fixtures[+b.dataset.fx].id; });
const fromHash = () => { const i = DATA.fixtures.findIndex(f => f.id === location.hash.slice(1)); return i < 0 ? 0 : i; };
addEventListener('hashchange', () => show(fromHash()));
new ResizeObserver(() => { resize(); if (!moved && geoCur) { frame(view, geoCur); draw(); } }).observe(stage);
const q = new URLSearchParams(location.search);
if (q.get('shot')) { document.body.classList.add('shot'); view = q.get('shot'); }
show(fromHash());
window.__ready = true;
