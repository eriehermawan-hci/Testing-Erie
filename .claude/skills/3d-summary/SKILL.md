---
name: 3d-summary
description: Membuat render 3D bersih (latar putih) per SKU Summary Accs dan preview 3D SKU di dalam racking (Wall 5 Rack) dari data Summary Accs + dimensi ruparupa.com. Pakai saat diminta "render 3D SKU", "preview racking", "3D Summary Accs", atau menambah grup display baru (Tidur, Penyimpanan, Dekorasi).
---

# 3D Summary Accs

Dua keluaran dari satu pipeline:

1. **PNG per SKU**: produk saja, latar putih, 1200×1200, nama file = kode artikel.
2. **Preview racking**: SKU diletakkan di Wall sesuai posisi shelving dan qty display, halaman HTML interaktif (three.js) + PNG depan/miring.

Status terakhir: grup **MAKAN & MINUM** selesai (31 SKU, Wall P1 dan P2, dengan mode display dari kolom Display w/Packing). Grup Tidur, Penyimpanan, Dekorasi belum. Pallet sudah dirender (Dumbin belum).

## Sumber data

| Data | Sumber |
|---|---|
| Daftar SKU, grup, fixture, kode posisi (S1–S5, PLT1–3), prioritas, qty display | Drive: folder `_Summary Accs` → `2_FOLDER_DATA_DRIVE` → **Dashboard.html** (id `1DSZ05boMvBHzmRVI-txuKgmnMHimrF4x`). Data ada di `const D = {...}` (field `arts`). Sheet aslinya (`List Item Summary Accessories`) terlalu besar untuk diekspor lewat Drive. |
| Dimensi dan foto produk | `https://www.ruparupa.com/p/<SKU>` (data di `__NEXT_DATA__`). Foto: `cdn.ruparupa.io/.../Products/<SKU>_1.jpg` |
| Layout rak | Bahan/gaya dari `planogram.html` (ash, upright berlubang, papan + lip putih), Wall 120×50×270, BASE 10 cm. **6 shelving bernomor 0–5**, jarak antar papan **45 cm** mulai dari bawah (papan bawah di atas plinth 10 cm). Shelving 0 (paling atas) **kosong untuk Media Komunikasi**; S1–S5 di sheet = Shelving 1–5. Panel belakang **diputihkan** (di preview saja; `planogram.html` tidak diubah). |

Matriks: Makan & Minum memakai S1–S4 di Wall (S0 = Media Komunikasi, S5 kosong = STOCK). Fixture pertama grup diisi SKU **P1**, fixture kedua **P2**. Shelving 0 paling atas, 5 paling bawah.

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

- Per shelving: lebar 120 cm, kedalaman 50 cm (dikurangi lip 1 cm), tinggi bebas = 45 − 2,5 = 42,5 cm (jarak antar papan dikurangi tebal papan).
- SKU diisi kiri→kanan sesuai urutan sheet; deret ke belakang sampai kedalaman habis; boleh diputar 90° bila menghemat lebar (set toples).
- Piring/mangkuk/gelas boleh ditumpuk (`stack.inc` = tambahan tinggi per unit, `max` = batas), selebihnya 1 lapis.
- SKU lebih tinggi dari zona → tidak dirender, status "Terlalu tinggi". Lebar habis → "Tidak muat".
- Sisa lebar dibagi ke SKU yang paling kurang terpenuhi. Hasil dilaporkan sebagai **muat / rencana** per SKU dan per shelving.

## Mode display (kolom "Display w/Packing" di data pengguna)

Data pengguna memuat kolom ini per SKU; petanya ada di `DW` pada `build_data.py`. Mode menentukan cara SKU ditampilkan di racking:

| Mode | Arti | Cara dirender |
|---|---|---|
| `DISPLAY ONLY` | Produk terbuka penuh, tanpa kotak packing | Seperti biasa (deret, tumpuk bila piring/mangkuk/gelas) |
| `DISPLAY + PACKING` | Produk terbuka di paling depan, kotak packing di belakangnya | Per kolom: 1 unit terbuka + kotak di belakang (baris ke belakang, tumpuk maks 3 sesuai tinggi). **Setiap kotak punya foto produk di sisi depan** |
| `PDQ N` | Tampilan dalam tray; 1 tray berisi N pcs sesuai pola; jumlah tray = qty ÷ N | Tray kardus putih berdinding rendah berisi produk, boleh ditumpuk (maks 6) selama tinggi cukup |

Pola isi tray PDQ: **12 = 4×3**, **54 = 3×3 tumpuk 6 pcs**, **32 = 4×4 tumpuk 2 pcs**, **30 = 6×5**, **25 = 5×5** (kolom × baris ke belakang). Rujukan foto: tray kardus putih bertumpuk berisi gelas.

**Aturan flat pack:** produk flat pack (kotak tipis, contoh rak piring Starlight dan Willard) harus **berdiri menghadap depan, tidak tidur**. Implementasi: sisi paling tipis jadi kedalaman, sisi terlebar jadi lebar, sisi sisanya jadi tinggi (`standing()` di `build_data.py`); foto produk di sisi depan kotak. Tandai dengan `flat=True` pada `BOXRAW`.

Dimensi kotak diambil dari data kemasan ruparupa/SAP (`product_length/width/height`). Foto depan kotak dipilih manual per SKU (`BOXIMG`, thumbnail 300 px di-embed sebagai data URI).

Asumsi yang perlu dikonfirmasi: jumlah tray = qty display ÷ N (mis. Kirby 48 pcs = 4 tray PDQ 12).

## Logika isi penuh dan feedback Excel

- **Shelving harus penuh, tanpa celah.** Qty sheet dipenuhi dulu (SKU yang paling kurang didahulukan). Sisa lebar diisi dengan **menggandakan SKU bergiliran** (facing tambahan) sampai tidak ada kolom lagi yang muat. Kedalaman shelving diisi penuh; tumpukan dipakai bila perlu. Hasil tampil bisa lebih besar dari qty sheet.
- **Kotak packing antar pcs harus terlihat berbeda:** tiap kotak diberi garis tepi tegas (`LineSegments2`, lebar 2,2 px) dan jarak 0,35 cm antar kotak/kolom, sisi kotak berwarna kraft sedikit gelap, foto produk di sisi depan.
- **Perbandingan qty sheet vs shelving** dihitung di `viewer.js` (`window.__report()`, memakai `packShelf` yang sama dengan render). Status per SKU: CUKUP (kapasitas ≥ qty sheet), KURANG, TIDAK MUAT (lebar/tinggi/dalam). Per shelving: FIT bila semua SKU CUKUP; kolom kekurangan lebar = lebar yang dibutuhkan qty sheet dikurangi lebar shelving.
- **Excel feedback:** `node report.js report.json` (ambil laporan lewat Playwright) lalu `python3 build_excel.py report.json Feedback_Fit_Shelving.xlsx`. Sheet: Ringkasan Shelving, Rekomendasi, Detail SKU, Asumsi.
- **Pallet ikut dirender.** Batas tinggi display **120 cm dari dasar pallet** (garis merah putus-putus di 3D; pallet setinggi 12 cm, jadi tinggi bebas 108 cm), sisanya untuk stock. Tray boleh ditumpuk sampai batas itu (`trayMax` 20 di data).
- **Pallet ke-1 (Arvid) punya 3 opsi tampilan pada pallet yang sama:** Piring, Mangkuk, Mug (satu SKU per opsi, fixture `pallet-1-piring/-mangkuk/-mug` dengan `group: pallet-1`). Tiap opsi dihitung sendiri. Di viewer muncul tombol "Opsi tampilan".
- **Jarak antar produk Display only: 0,5 cm** (`OGAP` di `viewer.js`).
- **Isi penuh sampai belakang:** baris ke belakang dibagi rata sehingga baris terakhir menempel ke sisi belakang shelving (kotak packing juga: sisa kedalaman dibagi rata antar kotak).
- **Greta:** tray SKU 360 dan 440 dibuat sama; ukuran gelas memakai yang kecil (360), tinggi gelas 440 dibuat 1 cm lebih tinggi (`products.json`).
- **Urutan SKU di shelving mengikuti urutan baris di tabel pengguna** (`ORDER` di `build_data.py`), bukan urutan dashboard.

## Hal yang sudah diputuskan / perlu diingat

- **Kirby Vacuum Flask 420 ml**: ruparupa menulis tinggi 25 cm untuk Abu-abu/Peach/Ungu, tetapi data kemasan ~17 cm dan foto menunjukkan tumbler pendek → dipakai **12 cm** (sama dengan Hijau).
- **Darya 500 ml**: ruparupa 8,2×8,8×25 cm; terlihat lebih gemuk dari foto, kemungkinan ukuran kemasan, tapi angka ruparupa tetap dipakai.
- **Gelas di set Halli**: dimensi tidak ada → diasumsikan dia atas 7 × tinggi 9 cm.
- Mug Arvid berwarna "Random" di ruparupa → dipakai abu-abu seri Arvid Grey.
- Temuan: qty display di sheet **tidak muat** di Wall berukuran asli (mis. Wall P2 hanya 54%); Laporkan ini ke pengguna. (Dengan jarak lama 35 cm, Starlight Dish Rack 36,5 cm tidak muat; dengan 45 cm muat.)
- Bahan transparan memakai mode "lite" (opacity) di scene racking supaya ringan; render per SKU memakai transmission penuh.
- Screenshot headless (SwiftShader) lambat untuk scene dengan banyak objek transparan: beri `timeout` besar di `goto` dan `screenshot`.
- Keluaran lama ada di `renders/makan-minum/` (PNG per SKU, `_manifest.csv`, `racking/`, `preview_racking.html`).
