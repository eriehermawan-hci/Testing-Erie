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
function packShelf(sh, W, D, C) {
  const rep = sh.items.map(it => {
    const s = DATA.skus[it.k], t = TPL[it.k], r = { k: it.k, qd: it.qd, nm: s.nm, pr: s.pr, h: t.h, placed: 0, cols: 0, rows: 0, n: 1, rot: false, flag: '' };
    if (t.h > C + 0.01) { r.flag = 'tinggi'; return r; }
    r.n = s.stack ? Math.max(1, Math.min(s.stack.max, 1 + Math.floor((C - t.h) / s.stack.inc))) : 1; r.inc = s.stack ? s.stack.inc : 0;
    let best = null;
    for (const rot of [false, true]) {
      const fw = rot ? t.d : t.w, fd = rot ? t.w : t.d, rows = Math.floor(D / fd);
      if (rows < 1) continue;
      const need = Math.ceil(Math.ceil(it.qd / r.n) / rows), wn = need * fw;
      if (!best || wn < best.wn - 0.01) best = { rot, fw, fd, rows, need, wn };
    }
    if (!best) { r.flag = 'dalam'; return r; }
    Object.assign(r, { rot: best.rot, fw: best.fw, fd: best.fd, rows: best.rows, need: best.need, cols: 0 });
    return r;
  });
  const ok = rep.filter(r => !r.flag);
  let used = 0; for (const r of ok) { if (used + r.fw <= W + 0.01) { r.cols = 1; used += r.fw; } else r.flag = 'lebar'; }
  for (;;) {
    let pick = null, rem = W - used;
    for (const r of ok) { if (!r.cols || r.cols >= r.need || r.fw > rem + 0.01) continue; const un = 1 - (r.cols * r.rows * r.n) / r.qd; if (!pick || un > pick.un) pick = { r, un }; }
    if (!pick) break; pick.r.cols++; used += pick.r.fw;
  }
  for (const r of ok) if (r.cols) r.placed = Math.min(r.qd, r.cols * r.rows * r.n);
  const m = ok.filter(r => r.cols).length, gap = m ? (W - used) / (m + 1) : 0;
  let x = -W / 2 + gap;
  for (const r of ok) if (r.cols) { r.x0 = x; x += r.cols * r.fw + gap; }
  rep.forEach(r => { if (!r.flag) r.flag = r.placed >= r.qd ? 'muat' : 'sebagian'; });
  return { rep, used };
}

/* ---------- membangun fixture ---------- */
let group = null, cur = 0, labels = [];
function buildWall(fx, g) {
  const { w: W, d: D, h: H } = fx.size, UP = 3.4, hs = fx.zones, sum = hs.reduce((a, b) => a + b, 0), topBlank = H - BASE - sum;
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
  return { bands: [{ top: 12, clear: H, h: H }], W, D, H: 12 + H };
}
function place(fx, geo, g) {
  const reps = [];
  fx.shelves.forEach((sh, si) => {
    const band = geo.bands[si], lip = fx.kind === 'wall' ? LIP : 0, D = geo.D - lip;
    const { rep, used } = packShelf(sh, geo.W, D, band.clear);
    const zFront = geo.D / 2 - lip;
    rep.forEach(r => {
      if (!r.placed) return;
      const slots = Math.ceil(r.placed / r.n);
      for (let s = 0; s < slots; s++) {
        const row = Math.floor(s / r.cols), col = s % r.cols, units = Math.min(r.n, r.placed - s * r.n);
        const x = r.x0 + col * r.fw + r.fw / 2, z = zFront - r.fd / 2 - row * r.fd;
        for (let u = 0; u < units; u++) { const c = TPL[r.k].piv.clone(true); c.position.set(x, band.top + u * (r.inc || 0), z); if (r.rot) c.rotation.y = Math.PI / 2; c.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); g.add(c); }
      }
    });
    if (fx.kind === 'wall' && !sh.items.length) { const p = textPlane('S T O C K', 60, 7, 'rgba(40,50,66,.55)'); p.position.set(0, band.top + band.clear / 2, -geo.D / 2 + 1.3); g.add(p); }
    reps.push({ code: sh.code, band, rep, used, qty: sh.items.reduce((a, b) => a + b.qd, 0) });
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
function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); draw(); }

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
    el.innerHTML = fx.kind === 'wall' ? `<b>Shelving ${si + 1}</b><span>${r.code} · ${r.qty ? nf(r.qty) + ' pcs' : 'stock'}</span>` : `<b>${esc(fx.label)}</b><span>${r.code} · ${nf(r.qty)} pcs</span>`;
    labelsEl.appendChild(el);
    labels.push({ el, pos: new THREE.Vector3(-geoCur.W / 2 - (fx.kind === 'wall' ? 6 : 4), r.band.top + Math.min(r.band.clear, 40) / 2, geoCur.D / 2) });
  });
  moved = false; resize(); frame(view, geoCur); renderer.shadowMap.needsUpdate = true; draw(); renderPanel(fx); setTabs();
}

/* ---------- panel keterangan ---------- */
const STATUS = { muat: ['Muat', 'ok'], sebagian: ['Sebagian', 'warn'], tinggi: ['Terlalu tinggi', 'bad'], lebar: ['Tidak muat', 'bad'], dalam: ['Terlalu dalam', 'bad'] };
function renderPanel(fx) {
  const tot = repsCur.reduce((a, r) => a + r.qty, 0), pl = repsCur.reduce((a, r) => a + r.rep.reduce((x, y) => x + y.placed, 0), 0);
  $('#sum').innerHTML = `<div><span>Rencana qty</span><b>${nf(tot)}</b><i>pcs</i></div><div><span>Muat di rak</span><b>${nf(pl)}</b><i>pcs</i></div><div><span>Terisi</span><b>${tot ? Math.round(pl / tot * 100) : 0}%</b><i>dari rencana</i></div>`;
  $('#ttl').textContent = fx.title; $('#dim').textContent = `${fx.size.w} × ${fx.size.d} × ${fx.size.h} cm` + (fx.kind === 'wall' ? ' · tinggi shelving 35 / 35 / 70 / 35 / 35 cm' : '');
  $('#shelves').innerHTML = repsCur.map((r, si) => {
    const p = r.rep.reduce((a, b) => a + b.placed, 0), pct = r.qty ? Math.round(p / r.qty * 100) : 0;
    const head = fx.kind === 'wall' ? `Shelving ${si + 1} <i>${r.code}</i>` : `Pallet <i>${r.code}</i>`;
    if (!r.rep.length) return `<section class="sh"><header><h3>${head}</h3><span class="mut">Kosong · area STOCK</span></header></section>`;
    return `<section class="sh"><header><h3>${head}</h3><span class="mut">${nf(p)} / ${nf(r.qty)} pcs</span></header>
      <div class="bar" role="img" aria-label="Terisi ${pct}%"><u style="width:${pct}%"></u></div>
      <p class="clr">Tinggi bebas ${r.band.clear.toFixed(1)} cm · lebar terpakai ${r.used.toFixed(0)} dari ${geoCur.W} cm</p>
      <ul>${r.rep.map(x => { const st = STATUS[x.flag]; return `<li data-k="${x.k}"><code>${x.k}</code><span class="nm">${esc(x.nm)}</span><span class="q">${nf(x.placed)}<small> / ${nf(x.qd)}</small></span><em class="chip ${st[1]}">${st[0]}</em>${x.flag === 'tinggi' ? `<p class="note">Tinggi ${x.h.toFixed(1)} cm melebihi ${r.band.clear.toFixed(1)} cm</p>` : x.flag === 'lebar' ? '<p class="note">Lebar rak habis, SKU ini tidak kebagian tempat</p>' : x.n > 1 ? `<p class="note">Ditumpuk sampai ${x.n} unit</p>` : ''}</li>`; }).join('')}</ul></section>`;
  }).join('');
  document.querySelectorAll('#shelves li').forEach(li => { const k = li.dataset.k; li.addEventListener('mouseenter', () => hi(k, true)); li.addEventListener('mouseleave', () => hi(k, false)); li.addEventListener('focusin', () => hi(k, true)); li.addEventListener('focusout', () => hi(k, false)); li.tabIndex = 0; });
}
function hi(k, on) { TPL[k].mats.forEach(m => { if (m.emissive) { m.emissive.set(on ? 0x2a86ff : 0x000000); m.emissiveIntensity = on ? 0.55 : 0; } }); draw(); }

/* ---------- kontrol ---------- */
function setTabs() { document.querySelectorAll('[data-fx]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.fx === cur))); document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view))); }
$('#tabs').innerHTML = DATA.fixtures.map((f, i) => `<button role="tab" data-fx="${i}" aria-selected="false">${esc(f.tab)}</button>`).join('');
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-fx]'); if (b) { location.hash = DATA.fixtures[+b.dataset.fx].id; } });
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; moved = false; frame(view, geoCur); setTabs(); draw(); }));
const fromHash = () => { const i = DATA.fixtures.findIndex(f => f.id === location.hash.slice(1)); return i < 0 ? 0 : i; };
addEventListener('hashchange', () => show(fromHash()));
new ResizeObserver(() => { resize(); if (!moved && geoCur) { frame(view, geoCur); draw(); } }).observe(stage);
const q = new URLSearchParams(location.search);
if (q.get('shot')) { document.body.classList.add('shot'); view = q.get('shot'); }
show(fromHash());
window.__ready = true;
