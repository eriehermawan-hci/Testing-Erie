---
name: 3d-summary
description: Membuat render 3D bersih (latar putih) per SKU Summary Accs dan preview 3D SKU di dalam racking (Wall 5 Rack) dari data Summary Accs + dimensi ruparupa.com. Pakai saat diminta "render 3D SKU", "preview racking", "3D Summary Accs", atau menambah grup display baru (Tidur, Penyimpanan, Dekorasi).
---

# 3D Summary Accs

Dua keluaran dari satu pipeline:

1. **PNG per SKU**: produk saja, latar putih, 1200×1200, nama file = kode artikel.
2. **Preview racking**: SKU diletakkan di Wall sesuai posisi shelving dan qty display, halaman HTML interaktif (three.js) + PNG depan/miring.

Status terakhir: grup **MAKAN & MINUM** selesai (31 SKU, Wall P1 dan P2). Grup Tidur, Penyimpanan, Dekorasi belum. **Pallet dan Dumbin sengaja dikecualikan dulu**, prioritas di Wall. Kodenya untuk Pallet sudah ada di `viewer.js` (`buildPallet`) tapi fixture-nya dimatikan di `build_data.py`.

## Sumber data

| Data | Sumber |
|---|---|
| Daftar SKU, grup, fixture, kode posisi (S1–S5, PLT1–3), prioritas, qty display | Drive: folder `_Summary Accs` → `2_FOLDER_DATA_DRIVE` → **Dashboard.html** (id `1DSZ05boMvBHzmRVI-txuKgmnMHimrF4x`). Data ada di `const D = {...}` (field `arts`). Sheet aslinya (`List Item Summary Accessories`) terlalu besar untuk diekspor lewat Drive. |
| Dimensi dan foto produk | `https://www.ruparupa.com/p/<SKU>` (data di `__NEXT_DATA__`). Foto: `cdn.ruparupa.io/.../Products/<SKU>_1.jpg` |
| Layout rak | Logika `planogram.html` di repo: Wall 5 Rack = zona `R1 R1 R2 R1 R1`, 1 satuan = 35 cm, BASE 10 cm, Wall 120×50×270. Panel belakang **diputihkan** (di preview saja; `planogram.html` tidak diubah). |

Matriks: Makan & Minum memakai S1–S4 di Wall (S5 kosong = STOCK). Fixture pertama grup diisi SKU **P1**, fixture kedua **P2**. Shelving ke-1 paling atas.

## Persiapan environment (cloud)

`www.ruparupa.com`, `ruparupa.com`, dan `cdn.ruparupa.io` harus ada di allowlist jaringan. Playwright + Chromium sudah terpasang; `npm i three@0.170.0` di folder kerja. Salin isi `scripts/` ke folder kerja sementara (skrip membaca/menulis file di folder aktif).

## Langkah

1. **Ambil data SKU**: `download_file_content` Dashboard.html → simpan hasil JSON → `python3 extract_dashboard.py hasil.json "MAKAN & MINUM"` (menghasilkan `dash.html`, `mm.json`).
2. **Dimensi dan foto**: `python3 fetch_all.py` (butuh `mm.json`; hasil `rr.json`, foto di `ref/`). Cek teks `Dimensi produk: P x L x T cm`. Bila tidak ada, `cm.py <SKU>` mencari ukuran lain; fallback ke data kemasan SAP (`product_length/width/height`) dan diameter dari nama produk. **Selalu lihat foto referensi** (contact sheet) sebelum memodelkan.
3. **Model per jenis produk**: tambah builder di `models.js` (`builders = {...}`: tavia, kirby, halli, bowl, plate, mug, glass, kay, darya, jars, willard, starlight). SKU baru → isi `products.json` (`model`, ukuran cm, warna `#hex`). Satuan cm, alas di y=0, depan = +z. Jangan memakai `G.add(x).position.set(...)` (itu memindahkan grup, bukan mesh).
4. **Render per SKU**: `node shoot.js <folder keluaran> [sku1,sku2]` (memakai `render.html` + `products.json`). Periksa lewat contact sheet; perbaiki pencahayaan/material bila terlalu terang atau plastik bening tak terlihat.
5. **Preview racking**: `python3 build_data.py` (→ `rack_data.json`, atur `STACK` untuk piring/mangkuk/gelas dan daftar fixture), lalu `python3 build.py cdn out_body.html` (untuk Artifact, three dari jsdelivr) atau `python3 build.py local ...` (untuk screenshot lokal, butuh `node_modules`). PNG: `node shoot_rack.js <folder> [wall-p1]`. Untuk file di repo, bungkus dengan `<!doctype html>...<body>`.
6. **Manifest**: tulis CSV (SKU, nama, dimensi dipakai, sumber, catatan/asumsi). Setiap dimensi yang diestimasi harus dicatat.
7. Publikasikan preview sebagai Artifact (file body dari langkah 5, tanpa doctype), commit PNG/HTML/skrip ke branch.

## Aturan susun racking (viewer.js `packShelf`)

- Per shelving: lebar 120 cm, kedalaman 50 cm (dikurangi lip 1 cm), tinggi bebas = tinggi zona − 2,5 cm papan.
- SKU diisi kiri→kanan sesuai urutan sheet; deret ke belakang sampai kedalaman habis; boleh diputar 90° bila menghemat lebar (set toples).
- Piring/mangkuk/gelas boleh ditumpuk (`stack.inc` = tambahan tinggi per unit, `max` = batas), selebihnya 1 lapis.
- SKU lebih tinggi dari zona → tidak dirender, status "Terlalu tinggi". Lebar habis → "Tidak muat".
- Sisa lebar dibagi ke SKU yang paling kurang terpenuhi. Hasil dilaporkan sebagai **muat / rencana** per SKU dan per shelving.

## Hal yang sudah diputuskan / perlu diingat

- **Kirby Vacuum Flask 420 ml**: ruparupa menulis tinggi 25 cm untuk Abu-abu/Peach/Ungu, tetapi data kemasan ~17 cm dan foto menunjukkan tumbler pendek → dipakai **12 cm** (sama dengan Hijau).
- **Darya 500 ml**: ruparupa 8,2×8,8×25 cm; terlihat lebih gemuk dari foto, kemungkinan ukuran kemasan, tapi angka ruparupa tetap dipakai.
- **Gelas di set Halli**: dimensi tidak ada → diasumsikan dia atas 7 × tinggi 9 cm.
- Mug Arvid berwarna "Random" di ruparupa → dipakai abu-abu seri Arvid Grey.
- Temuan: qty display di sheet **tidak muat** di Wall berukuran asli (mis. Wall P2 hanya 54%); Starlight Dish Rack (36,5 cm) lebih tinggi dari shelving (32,5 cm). Laporkan ini ke pengguna.
- Bahan transparan memakai mode "lite" (opacity) di scene racking supaya ringan; render per SKU memakai transmission penuh.
- Screenshot headless (SwiftShader) lambat untuk scene dengan banyak objek transparan: beri `timeout` besar di `goto` dan `screenshot`.
- Keluaran lama ada di `renders/makan-minum/` (PNG per SKU, `_manifest.csv`, `racking/`, `preview_racking.html`).
