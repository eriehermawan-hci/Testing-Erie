import * as THREE from 'three';
/* ---------- helpers ---------- */
const matSolid = (hex, rough = 0.45) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: rough, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.4 });
let CLEAR_MODE = 'high';
export const setClearMode = m => { CLEAR_MODE = m; };
const matClear = (tint = 0xffffff, att = 6) => CLEAR_MODE === 'lite' ? new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(tint).lerp(new THREE.Color(0xffffff), 0.55), roughness: 0.05, metalness: 0, transparent: true, opacity: 0.34, depthWrite: false, clearcoat: 1, side: THREE.DoubleSide }) : new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(tint).lerp(new THREE.Color(0xffffff), 0.75), transmission: 1, roughness: 0.02, thickness: 0.5, ior: 1.5,
  attenuationColor: new THREE.Color(tint), attenuationDistance: att * 1.2, specularIntensity: 1, side: THREE.DoubleSide });
const mk = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = false; return m; };

function rrShape(w, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
// extrude a shape upward (+y), base at y0
function ext(shape, h, y0, bevel = 0.12) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 });
  g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); return g;
}
function lathe(pts, seg = 96, flutes = 0, amp = 0.025) {
  const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
  if (flutes) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z); if (r < 1e-4) continue;
      const k = 1 + amp * Math.cos(Math.atan2(z, x) * flutes);
      pos.setX(i, x * k); pos.setZ(i, z * k);
    }
    g.computeVertexNormals();
  }
  return g;
}

let G;

/* ---------- product builders (units = cm) ---------- */

const steel = () => new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 1, roughness: 0.22 });
const porcelain = (hex = 0xf7f7f4) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.18, clearcoat: 0.7, clearcoatRoughness: 0.12 });
const rod = (p, q, r, mat, seg = 8) => {
  const v = new THREE.Vector3().subVectors(new THREE.Vector3(...q), new THREE.Vector3(...p));
  const m = mk(new THREE.CylinderGeometry(r, r, v.length(), seg), mat);
  m.position.set(...p).addScaledVector(v, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize()); return m;
};
const tube = (pts, r, mat, sx = 1, sz = 1) => { const m = mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 10, false), mat); return m; };
const builders = {
  // Tavia 1L pitcher: 6.5 x 6.5 x 23
  tavia(o) {
    const W = 6.5, H = 23, lidH = 2.6, wall = 0.28;
    const outer = rrShape(W, W, 1.3), inner = rrShape(W - 2 * wall, W - 2 * wall, 1.05);
    const tube = rrShape(W, W, 1.3); tube.holes.push(new THREE.Path(inner.getPoints(24)));
    G.add(mk(new THREE.ExtrudeGeometry(tube, { depth: H - lidH - 0.3, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2).translate(0, 0.3, 0), matClear(0xc9dbe6, 12)));
    G.add(mk(ext(rrShape(W - 0.1, W - 0.1, 1.3), 0.3, 0, 0), matClear(0xc9dbe6, 12)));
    const lidMat = matSolid(o.lid, 0.4);
    G.add(mk(ext(rrShape(W + 0.25, W + 0.25, 1.4), lidH - 0.3, H - lidH, 0.15), lidMat));
    const flap = mk(new THREE.BoxGeometry(W * 0.62, 0.55, W * 0.55), lidMat); flap.position.set(0, H + 0.1, W * 0.12); G.add(flap);
    const nub = mk(new THREE.BoxGeometry(W * 0.62, 0.9, 0.5), lidMat); nub.position.set(0, H + 0.0, W * 0.12 + W * 0.3); G.add(nub);
  },
  // Kirby vacuum tumbler: ~8.6 x 7.3 x 12
  kirby(o) {
    const body = lathe([[0, 0], [2.55, 0], [2.78, 0.3], [3.35, 3.0], [3.62, 9.8], [3.66, 10.3], [0, 10.3]], 96);
    G.add(mk(body, matSolid(o.body, 0.5)));
    G.add(mk(lathe([[3.78, 10.2], [3.84, 10.5], [3.84, 11.3], [3.4, 11.75], [0, 11.8]], 96), matSolid(o.lid, 0.45)));
    const tab = mk(new THREE.BoxGeometry(2.9, 0.5, 2.3), matSolid(o.tab, 0.4)); tab.position.set(0.5, 11.85, 0); tab.rotation.z = -0.04; G.add(tab);
    const hinge = mk(new THREE.BoxGeometry(1.5, 0.7, 1.8), matSolid(o.tab, 0.4)); hinge.position.set(-1.9, 11.75, 0); G.add(hinge);
    // strap
    const strap = mk(new THREE.BoxGeometry(0.16, 6.6, 1.15), matSolid(0xe4e4df, 0.9)); strap.position.set(-4.12, 7.2, 0); G.add(strap);
    const loop = mk(new THREE.TorusGeometry(0.6, 0.09, 8, 24, Math.PI), matSolid(0xe4e4df, 0.9)); loop.position.set(-3.95, 10.5, 0); loop.rotation.z = Math.PI / 2 * 0 + Math.PI / 2; G.add(loop);
    const snap = mk(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 20), matSolid(0xb9bcc0, 0.3)); snap.rotation.z = Math.PI / 2; snap.position.set(-4.24, 5.1, 0); G.add(snap);
  },
  // Halli jug 1 pc + 4 glasses
  halli(o) {
    const tint = 0xcfe6dc;
    const jug = lathe([[0, 0.0], [3.9, 0.0], [4.2, 0.35], [4.65, 2.0], [4.75, 16.5], [4.55, 17.2], [4.2, 17.2], [4.35, 16.5], [4.45, 2.2], [4.0, 0.9], [0, 0.9]], 120, 28, 0.03);
    const jugG = new THREE.Group();
    jugG.add(mk(jug, matClear(0xcfe6dc, 5)));
    const lid = mk(lathe([[0, 17.0], [4.6, 17.0], [4.7, 17.3], [4.7, 18.3], [4.2, 18.7], [0, 18.75]], 96), matSolid(0xf3efe2, 0.45)); jugG.add(lid);
    const knob = mk(new THREE.SphereGeometry(0.75, 24, 16), matSolid(0xf3efe2, 0.45)); knob.position.y = 19.1; knob.scale.y = 0.75; jugG.add(knob);
    const curve = new THREE.CatmullRomCurve3([[4.5, 16.2, 0], [6.6, 16.0, 0], [8.0, 13.5, 0], [8.1, 8.5, 0], [7.0, 4.8, 0], [4.6, 3.6, 0]].map(p => new THREE.Vector3(...p)));
    jugG.add(mk(new THREE.TubeGeometry(curve, 48, 0.55, 12, false), matSolid(0x9fcdbb, 0.4)));
    jugG.position.x = -3.2; G.add(jugG);
    const glassPts = [[0, 0], [2.55, 0], [2.7, 0.4], [3.55, 8.8], [3.4, 9.0], [3.25, 8.8], [2.4, 0.9], [0, 0.9]];
    [[10.0, 3.6], [17.0, 3.6], [10.0, -3.8], [17.0, -3.8]].forEach(([x, z]) => {
      const gl = mk(lathe(glassPts, 96, 24, 0.03), matClear(0xd3e3ea, 8)); gl.position.set(x, 0, z); G.add(gl);
    });
  }
,
  // Porcelain bowl
  bowl(o) {
    const r = o.d / 2, h = o.h, N = 14, pts = [[0, 0], [0.5 * r, 0], [0.54 * r, 0.06 * h]];
    for (let i = 1; i <= N; i++) { const t = i / N; pts.push([r * (0.54 + 0.46 * Math.sin(t * Math.PI / 2)), h * (0.06 + 0.94 * t)]); }
    const th = 0.035 * r;
    for (let i = N; i >= 1; i--) { const t = i / N; pts.push([r * (0.54 + 0.46 * Math.sin(t * Math.PI / 2)) - th, h * (0.06 + 0.94 * t) - (i === N ? 0.0 : 0.0)]); }
    pts.push([0.46 * r, h * 0.2], [0, h * 0.17]);
    G.add(mk(lathe(pts, 128), porcelain(o.color)));
  },
  // Plate / soup plate
  plate(o) {
    const r = o.d / 2, h = o.h, k = o.deep ? 0.28 : 0.12;
    const pts = [[0, 0], [0.58 * r, 0], [0.6 * r, 0.08 * h], [0.95 * r, 0.55 * h], [r, h], [0.975 * r, h], [0.93 * r, 0.62 * h], [0.7 * r, k * h + 0.05], [0.4 * r, k * h], [0, k * h]];
    G.add(mk(lathe(pts, 128), porcelain(o.color)));
  },
  // Mug with handle
  mug(o) {
    const r = o.d / 2, h = o.h;
    G.add(mk(lathe([[0, 0], [r * 0.82, 0], [r * 0.9, 0.5], [r, 2.5], [r * 1.02, h], [r * 0.93, h], [r * 0.9, 1.2], [0, 1.1]], 96), porcelain(o.color)));
    const hr = o.hand;
    G.add(mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[r * 0.98, h * 0.84, 0], [r + hr * 0.9, h * 0.78, 0], [r + hr, h * 0.5, 0], [r + hr * 0.6, h * 0.2, 0], [r * 0.9, h * 0.2, 0]].map(p => new THREE.Vector3(...p))), 40, 0.5, 10), porcelain(o.color)));
  },
  // Faceted glass tumbler
  glass(o) {
    const pts = [[0, 0], [o.rb * 0.92, 0], [o.rb, 0.3], [o.rt, o.h], [o.rt - 0.25, o.h], [o.rb - 0.2, 1.25], [0, 1.1]];
    G.add(mk(lathe(pts, 120, o.facets, 0.035), matClear(0xe3eef2, 10)));
  },
  // Kay 880ml tumbler with handle + straw
  kay(o) {
    const m = matSolid(o.color, 0.55), st = steel();
    G.add(mk(lathe([[0, 0], [2.3, 0], [2.45, 0.4], [3.0, 5], [3.5, 12], [3.6, 20.4], [0, 20.4]], 96), m));
    G.add(mk(lathe([[3.7, 20.4], [3.7, 21.2], [0, 21.2]], 96), st));
    G.add(mk(lathe([[3.55, 21.2], [3.5, 21.9], [3.0, 22.5], [0, 22.5]], 96), m));
    const hd = tube([[3.3, 19.6, 0], [5.8, 18.6, 0], [6.1, 14.5, 0], [6.0, 11.5, 0], [3.4, 9.5, 0]], 0.62, m); hd.scale.z = 1.7; G.add(hd);
    const strw = mk(new THREE.CylinderGeometry(0.38, 0.38, 8.5, 14), matClear(0xffffff, 20)); strw.position.set(-0.9, 21.5 + 1.2, 0.3); strw.rotation.z = 0.12; G.add(strw);
  },
  // Darya 500ml bottle
  darya(o) {
    const m = matSolid(o.color, 0.5);
    G.add(mk(lathe([[0, 0], [3.9, 0], [4.1, 0.4], [4.1, 17.5], [3.9, 19.5], [3.1, 21.3], [2.0, 22.6], [1.75, 23.0], [0, 23.0]], 96), m));
    const cap = mk(new THREE.CylinderGeometry(2.1, 2.1, 2.3, 48), steel()); cap.position.y = 23.85; G.add(cap);
    const lip = mk(new THREE.CylinderGeometry(2.3, 2.3, 0.4, 48), steel()); lip.position.y = 22.9; G.add(lip);
  },
  // Sets of jars (n pieces in a row)
  jars(o) {
    const n = o.n || 3, r = o.d / 2, L = o.L || (n * o.d + (n - 1) * 0.6), gap = (L - n * o.d) / (n - 1);
    const lidH = o.lidH, bodyH = o.h - lidH;
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + r + i * (o.d + gap), jar = new THREE.Group();
      const bulge = o.barrel ? 0.1 : 0.0;
      const pts = [[0, 0], [r * 0.82, 0], [r * 0.9, 0.35]];
      for (let t = 0; t <= 8; t++) { const y = 0.9 + (bodyH - 1.5) * t / 8; pts.push([r * (0.93 + bulge * Math.sin(Math.PI * t / 8)), y]); }
      pts.push([r * 0.86, bodyH - 0.25], [r * 0.86, bodyH], [r * 0.80, bodyH], [r * 0.80, bodyH - 0.5]);
      const wall = 0.28; const inner = []; for (let t = 8; t >= 0; t--) { const y = 0.9 + (bodyH - 1.5) * t / 8; inner.push([r * (0.93 + bulge * Math.sin(Math.PI * t / 8)) - wall, y]); }
      const prof = [[0, 0], [r * 0.82, 0], [r * 0.9, 0.35]];
      for (let t = 0; t <= 8; t++) { const y = 0.9 + (bodyH - 1.5) * t / 8; prof.push([r * (0.93 + bulge * Math.sin(Math.PI * t / 8)), y]); }
      prof.push([r * 0.88, bodyH]); prof.push([r * 0.88 - wall, bodyH]); inner.forEach(p => prof.push(p)); prof.push([r * 0.8, 0.5], [0, 0.45]);
      jar.add(mk(lathe(prof, 96), matClear(o.tint || 0xe3eef2, 10)));
      const lc = o.lidColor;
      if (o.style === 'wood') { const l = mk(new THREE.CylinderGeometry(r * 0.9, r * 0.9, lidH, 64), matSolid(0xcf9f61, 0.6)); l.position.y = bodyH + lidH / 2; jar.add(l); const rim = mk(new THREE.CylinderGeometry(r * 0.93, r * 0.93, 0.3, 64), matSolid(0x9b7340, 0.5)); rim.position.y = bodyH + 0.15; jar.add(rim); }
      else if (o.style === 'glass') { const l = mk(lathe([[0, bodyH], [r * 0.9, bodyH], [r * 0.9, bodyH + 0.35], [r * 0.45, bodyH + lidH * 0.8], [r * 0.12, bodyH + lidH], [0, bodyH + lidH]], 64), matClear(0xe8f1f4, 10)); jar.add(l); }
      else if (o.style === 'handle') { const l = mk(new THREE.CylinderGeometry(r * 0.96, r * 0.96, lidH * 0.55, 64), matSolid(lc, 0.4)); l.position.y = bodyH + lidH * 0.275; jar.add(l); const band = mk(new THREE.CylinderGeometry(r * 0.99, r * 0.99, lidH * 0.18, 64), matSolid(o.band || 0xa9b6c4, 0.4)); band.position.y = bodyH + lidH * 0.64; jar.add(band); const lp = mk(new THREE.TorusGeometry(r * 0.5, 0.35, 10, 32, Math.PI), matSolid(lc, 0.4)); lp.position.y = bodyH + lidH * 0.72; jar.add(lp); }
      else { const l = mk(new THREE.CylinderGeometry(r * 1.0, r * 1.0, lidH, 64), matSolid(lc, 0.35)); l.position.y = bodyH + lidH / 2; jar.add(l); if (o.style === 'flip') { const f = mk(new THREE.BoxGeometry(r * 1.2, 0.45, r * 0.9), matSolid(lc, 0.35)); f.position.set(0, bodyH + lidH + 0.2, 0); jar.add(f); } }
      jar.position.x = x; G.add(jar);
    }
  },
  // Willard extendable dish rack (47 x 30 x 13, white)
  willard(o) {
    const W = 47, D = 30, wm = matSolid(0xf4f4f2, 0.4);
    const tray = new THREE.Shape(); const t0 = rrShape(W, D, 3); const hole = new THREE.Path(rrShape(W - 2, D - 2, 2.5).getPoints(24)); t0.holes.push(hole);
    G.add(mk(new THREE.ExtrudeGeometry(t0, { depth: 2.6, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2), wm));
    G.add(mk(ext(rrShape(W - 0.5, D - 0.5, 3), 0.5, 0, 0), wm));
    for (let z = -11; z <= 11.01; z += 2.2) G.add(rod([-W / 2 + 2, 4.0, z], [W / 2 - 2, 4.0, z], 0.22, wm, 6));
    for (let x = -W / 2 + 2; x <= W / 2 - 1.9; x += 5.2) G.add(rod([x, 4.0, -11.4], [x, 4.0, 11.4], 0.25, wm, 6));
    for (const x of [-W / 2 + 2, W / 2 - 2]) { G.add(rod([x, 2.5, -11.4], [x, 4.0, -11.4], 0.25, wm, 6)); G.add(rod([x, 2.5, 11.4], [x, 4.0, 11.4], 0.25, wm, 6)); }
    for (let i = 0; i < 7; i++) { const x = -W / 2 + 4.5 + i * 3.6; for (const z of [-8.5, 8.5]) G.add(rod([x, 4.0, z], [x, 12.4, z], 0.22, wm, 6)); G.add(rod([x, 12.4, -8.5], [x, 12.4, 8.5], 0.22, wm, 6)); }
    const cut = new THREE.Shape(); const c0 = rrShape(10, 10, 1); c0.holes.push(new THREE.Path(rrShape(9.2, 9.2, 0.8).getPoints(16)));
    const cup = mk(new THREE.ExtrudeGeometry(c0, { depth: 11, bevelEnabled: false }).rotateX(-Math.PI / 2), wm); cup.position.set(W / 2 - 7.2, 2.6, -D / 2 + 7.2); G.add(cup);
    const cbase = mk(ext(rrShape(9.4, 9.4, 1), 0.5, 0, 0), wm); cbase.position.set(W / 2 - 7.2, 2.6, -D / 2 + 7.2); G.add(cbase);
  },
  // Starlight 2-tier chrome rack (42.5 x 25 x 36.5) with clear tray
  starlight(o) {
    const W = 42.5, D = 25, H = 36.5, st = steel(), cl = matClear(0xdfeaf0, 10);
    const t0 = rrShape(W, D, 1.5); t0.holes.push(new THREE.Path(rrShape(W - 1.2, D - 1.2, 1.2).getPoints(24)));
    G.add(mk(new THREE.ExtrudeGeometry(t0, { depth: 2.2, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2), cl));
    G.add(mk(ext(rrShape(W - 0.4, D - 0.4, 1.5), 0.4, 0, 0), cl));
    const shelf = (y, zs) => { for (let z = -zs; z <= zs + 0.01; z += 2.0) G.add(rod([-W / 2 + 1.5, y, z], [W / 2 - 1.5, y, z], 0.2, st, 6)); for (let x = -W / 2 + 1.5; x <= W / 2 - 1.4; x += 4.1) G.add(rod([x, y, -zs], [x, y, zs], 0.22, st, 6)); };
    shelf(3.6, 11.2); shelf(17.8, 11.2);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) G.add(rod([x * (W / 2 - 1.2), 3.6, z * 11.3], [x * (W / 2 - 1.2), 33.5, z * 11.3], 0.3, st));
    for (const y of [17.8, 33.5]) { G.add(rod([-W / 2 + 1.2, y, -11.3], [W / 2 - 1.2, y, -11.3], 0.28, st)); G.add(rod([-W / 2 + 1.2, y, 11.3], [W / 2 - 1.2, y, 11.3], 0.28, st)); G.add(rod([-W / 2 + 1.2, y, -11.3], [-W / 2 + 1.2, y, 11.3], 0.28, st)); G.add(rod([W / 2 - 1.2, y, -11.3], [W / 2 - 1.2, y, 11.3], 0.28, st)); }
    for (let i = 0; i < 8; i++) { const x = -W / 2 + 5 + i * 3.2; G.add(rod([x, 17.8, -9.5], [x, 24.5, -9.5], 0.2, st, 6)); G.add(rod([x, 17.8, 9.5], [x, 24.5, 9.5], 0.2, st, 6)); G.add(rod([x, 24.5, -9.5], [x, 24.5, 9.5], 0.2, st, 6)); }
    for (let i = 0; i < 5; i++) { const x = W / 2 - 6 - i * 3.4; G.add(rod([x, 3.6, -9.5], [x, 8.5, -9.5], 0.2, st, 6)); G.add(rod([x, 8.5, -9.5], [x, 8.5, 9.5], 0.2, st, 6)); G.add(rod([x, 3.6, 9.5], [x, 8.5, 9.5], 0.2, st, 6)); }
    for (const x of [-W / 2 + 4, -W / 2 + 9, -W / 2 + 14]) { G.add(rod([x, 33.5, -11.3], [x, H - 0.4, -11.3], 0.25, st, 6)); const b = mk(new THREE.SphereGeometry(0.45, 12, 10), st); b.position.set(x, H - 0.4, -11.3); G.add(b); }
  },
};

export function makeSku(cfg) {
  const o = Object.assign({}, cfg);
  for (const k of Object.keys(o)) if (typeof o[k] === 'string' && o[k][0] === '#') o[k] = new THREE.Color(o[k]).getHex();
  G = new THREE.Group();
  builders[o.model](o);
  const out = new THREE.Group(); out.add(G); G = null; return out;
}
