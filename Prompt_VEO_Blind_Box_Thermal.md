# Prompt VEO (Gemini): Blind Box Thermal "Pick Your Lucky Box"

Dua video, semua format **9:16 vertikal** (sesuai foto display dan video referensi).
Prompt ditulis dalam bahasa Inggris karena Veo paling akurat dengan itu. Teks Indonesia (caption, harga, CTA) **ditambahkan saat editing**, jangan diminta dari Veo karena teks di dalam video AI sering rusak.

---

## 0. Catatan teknis sebelum mulai

| Hal | Rekomendasi |
|---|---|
| Model | Veo 3.1 (atau Veo 3) di Gemini / Flow. Cek menu yang tersedia di akun Anda. |
| Durasi per generate | Veo membuat klip pendek (sekitar 4 sampai 8 detik). Video 15 detik = **2 klip**, video 24 detik = **3 klip**, lalu disambung di CapCut / Premiere. |
| Mode | **Image to video** (foto sebagai frame awal) atau **Ingredients to video** (sampai 3 foto referensi). |
| Menyambung klip | Screenshot frame terakhir klip sebelumnya, pakai sebagai frame awal klip berikutnya. Atau pakai fitur **Extend** di Flow. |
| Video referensi | Veo tidak bisa memakai video orang lain sebagai referensi. Gaya video referensi sudah saya terjemahkan menjadi kata-kata di prompt. |
| Wajah staf | Jangan pakai wajah staf di video referensi sebagai input. Pakai karakter AI generik berseragam Informa. |
| Teks dan logo | Logo "informa" pada box dan botol bisa bergeser sedikit. Gunakan foto sebagai referensi, hasil terbaik dipilih manual, perbaiki logo saat editing bila perlu. |
| Audio | Veo 3 membuat audio sendiri. Prompt di bawah meminta musik dan efek suara saja, voice over ditambahkan saat editing. |

**Negative prompt** (tempel di kolom negative, atau di akhir prompt setelah kata "Avoid:"):

```
text, subtitles, captions, watermark, extra bottles, missing bottles, deformed hands, extra fingers, melted or warped logos, blurry, low resolution, cartoon, 3D render look, overexposed, flicker, people looking at camera with distorted faces
```

---

## 1. Warna 12 botol (dipakai di kedua video)

Cocokkan dengan foto sebelum generate.

**6 botol slim, tanpa handle (SMALL)**
1. Candy pink
2. Sage green
3. Lilac / violet (paling tinggi)
4. Sky blue
5. Periwinkle (biru keunguan)
6. Lemon yellow

**6 botol wide-mouth dengan loop handle (LARGE)**
7. Charcoal grey
8. Aqua / teal mint, loop biru
9. Cream white, loop biru
10. Hot pink / fuchsia, loop kuning
11. Lavender, loop hitam
12. Marigold yellow, tutup dan loop oranye

Semua botol: matte soft-touch, warna pastel solid. Kemasan PDQ dan box: holographic iridescent pink, kuning, dan biru pastel, tulisan "mini Flask series" dan logo "informa".

---

# VIDEO 1: Ilustrasi cara display sesuai guidance

**Tujuan:** menunjukkan ke tim store urutan yang benar: endcap full, buka 1 PDQ SMALL dan 1 PDQ LARGE pelan-pelan, Secret diamankan, 5 atau 6 warna didisplay, POP terpasang.
**Total:** 3 klip x 8 detik = 24 detik, format 9:16.
**Input:** foto display endcap (foto yang Anda kirim) sebagai frame awal klip 1.

**Karakter (copy ke setiap klip supaya konsisten):**
`a female Indonesian store staff member in her 20s wearing a navy blue Informa retail uniform with orange and yellow trim, light grey hijab, friendly and calm`

**Lokasi (copy ke setiap klip):**
`a bright modern Indonesian department store, thermal drinkware section, a wooden-back endcap display with a steel and glass riser shelf holding 12 colorful matte bottles, three lower shelves filled with pink holographic PDQ boxes of "mini Flask series", clean tiled floor, soft white retail lighting`

### Klip 1 (0 sampai 8 detik): Endcap sudah full dan rapi

Frame awal: foto display.

```
Vertical 9:16, realistic commercial instructional video, shot from the provided photo of the store endcap. Start exactly on the photo composition: a fully stocked endcap with 12 colorful matte bottles on the glass riser shelf at the top and three lower shelves completely filled with pink holographic PDQ boxes, no empty gaps. The camera performs a slow smooth push-in toward the endcap. A female Indonesian store staff member in a navy blue Informa uniform with orange and yellow trim and a light grey hijab walks into frame from the left carrying two PDQ cartons, one smaller and one larger, stops beside the endcap and gives a small confident nod. Soft bright retail lighting, clean tiled floor, shallow depth of field on the background shelves. Realistic motion, steady camera, natural colors.
Audio: light upbeat instructional background music, soft store ambience, gentle footsteps. No speech.
Avoid: text, subtitles, watermark, extra bottles, distorted logos, empty shelves.
```

Caption saat editing: **"1. Display di Endcap Area Thermal, full terisi"**

### Klip 2 (8 sampai 16 detik): Buka PDQ pelan-pelan, Secret diamankan

Frame awal: frame terakhir klip 1, atau foto close-up PDQ jika ada.

```
Vertical 9:16, realistic instructional close-up video. Medium close-up on a clean white counter beside the endcap. The same female Indonesian store staff member in a navy blue Informa uniform with orange and yellow trim and light grey hijab slowly and carefully opens a pink holographic PDQ display carton by lifting the perforated front panel with both hands, very gently so the cardboard structure stays intact. Inside are six small iridescent product boxes. She takes out the boxes one by one and opens each, revealing six different pastel colored matte bottles: pink, sage green, lilac, sky blue, periwinkle and lemon yellow. One of the boxes reveals a special shimmering secret bottle with a sparkle effect: she smiles, closes that box again and places it gently into a small grey storage tote beside her to keep it safe, leaving five colored bottles lined up on the counter. Next to the first carton there is a second, larger PDQ carton that she will open the same careful way. Slow deliberate hand movements, soft top lighting, macro-level clean detail on the cardboard edges and bottle caps, subtle satisfying unboxing foley.
Audio: soft cardboard unfolding sounds, gentle sparkle chime when the secret bottle appears, calm upbeat music. No speech.
Avoid: text, subtitles, watermark, torn cardboard, rough or fast tearing, extra fingers, distorted logos.
```

Caption saat editing: **"2. Ambil 1 PDQ SMALL dan 1 PDQ LARGE, buka pelan-pelan"** lalu **"3. Dapat Secret? Amankan dulu, display 5 warna"**

### Klip 3 (16 sampai 24 detik): Display di riser, POP terpasang, hasil akhir

Frame awal: frame terakhir klip 2 atau foto display.

```
Vertical 9:16, realistic instructional video. Staff member in a navy blue Informa uniform with orange and yellow trim and light grey hijab places the opened pastel bottles one by one onto the glass riser shelf at the top of the endcap, arranging them neatly in a row from tallest to shortest, matte pastel colors pink, sage green, lilac, sky blue, periwinkle and yellow, plus the wide-mouth handle bottles in grey, aqua, cream, fuchsia, lavender and marigold. She then slides a printed A4 communication sign into the holder at the front edge of the riser, steps back one step and gives a small thumbs up. The camera slowly pulls back to a wide shot that matches the original photo composition: a complete, tidy, fully stocked endcap, all lower shelves full of pink holographic PDQ boxes, bottles glowing softly under bright retail lighting. Smooth steady camera, clean realistic retail look, natural colors.
Audio: cheerful light background music, soft placement taps of bottles on glass, small success chime at the end. No speech.
Avoid: text, subtitles, watermark, extra or missing bottles, messy shelves, distorted logos.
```

Caption saat editing: **"4. Pasang media komunikasi, jika belum ada pasang POP A4 dari MD"** dan akhir **"Display selesai, full dan rapi"**

> **Opsional klip 4 (area kasir):** pakai prompt klip 3, ganti lokasi menjadi `a small checkout counter display with open bottles on top and sealed stock boxes underneath`, hanya untuk store Dept + Kasir.

---

# VIDEO 2: Konten 12 botol, 15 detik, kekinian

**Konsep:** "12 warna, 1 lucky box." Visual pastel pop, ritme cepat mengikuti beat, ASMR unboxing, transisi match-cut, dan finale formasi warna yang memuaskan dilihat. Cocok untuk Reels, TikTok, dan Shorts.
**Struktur:** 2 klip x 8 detik, disambung dan dipotong jadi 15 detik.
**Input:** foto 12 botol (foto display Anda), plus foto produk lain bila ada. Jangan pakai wajah dari video referensi.

**Gaya dari video referensi (sudah diterjemahkan):** unboxing seru ala tim store, warna cerah, reaksi spontan, penutup "Dapatkan tumbler lucu ini, eksklusif hanya di Informa, happy shopping". Untuk konten ini gaya dinaikkan jadi lebih sinematik dan product-first.

**Storyboard 15 detik**

| Detik | Visual | Audio |
|---|---|---|
| 0 sampai 2 | Hook: macro tangan membuka PDQ holographic, kilau pelangi menyapu box | Suara kertas, "whoosh" |
| 2 sampai 5 | 12 botol "pop-in" satu per satu di panggung pastel, tiap botol mendarat di beat | Pop SFX tiap botol |
| 5 sampai 8 | Kamera orbit 180 derajat mengelilingi 12 botol, detail matte dan tutup | Musik naik |
| 8 sampai 11 | Cuplikan cepat 1 detik: botol di tas kuliah, meja kerja, cup holder mobil | Beat cepat |
| 11 sampai 13 | Top-down: 12 botol membentuk lingkaran warna (color wheel) berputar | Riser sound |
| 13 sampai 15 | Kamera pull-back, satu box misterius bersinar "?", ruang kosong untuk logo dan CTA | Sparkle, hit akhir |

### Klip A (0 sampai 8 detik)

Frame awal / referensi: foto 12 botol.

```
Vertical 9:16, premium Gen-Z social media commercial, hyper-clean pastel pop aesthetic, ASMR product video. Opening macro shot: manicured hands gently tear open a pink holographic iridescent PDQ carton, rainbow light sweeps across the shimmering box surface. Hard match-cut to a smooth pastel gradient studio set with stepped white pedestals: twelve matte soft-touch bottles pop into frame one by one in rhythm with the beat, each landing with a small bounce. Six slim bottles in pink, sage green, lilac, sky blue, periwinkle and lemon yellow, and six wide-mouth bottles with carry loops in charcoal grey, aqua, cream white, fuchsia, lavender and marigold. After the last bottle lands, the camera makes a smooth 180-degree orbit around the group, revealing the matte texture, cap details and loop handles, soft rim light, gentle sparkles in the air. Shallow depth of field, crisp colors, no clutter, trendy modern look, 24fps cinematic motion.
Audio: trendy upbeat lo-fi pop beat with a clear rhythm, crisp ASMR cardboard tear, bubbly pop sound for each bottle landing, soft whoosh on transitions. No speech.
Avoid: text, subtitles, watermark, extra or missing bottles, merged bottles, distorted logos, flicker, dark scenes.
```

### Klip B (8 sampai 15 detik, generate 8 detik lalu potong 1 detik)

Frame awal: frame terakhir klip A.

```
Vertical 9:16, same pastel pop Gen-Z commercial style and the same twelve matte bottles. Fast rhythmic montage of one-second shots in beat: a pastel bottle clipped to a university tote bag walking on campus, a bottle on a tidy work desk next to a laptop and a notebook, a bottle in a car cup holder, a hand flipping up a bottle's carry loop with a satisfying click. Then a smooth transition to a top-down shot on a pastel floor: the twelve bottles arrange themselves into a perfect rotating color wheel, slow clockwise spin, colors flowing from pink to yellow to green to blue to lavender. The camera pulls up and back, a single glowing mystery gift box with a sparkling question mark rises in the center of the circle with soft light and glitter, leaving clean empty space in the lower third of the frame for a logo. Bright soft lighting, crisp matte textures, trendy modern look, smooth motion.
Audio: same upbeat lo-fi pop beat building to a satisfying final hit, riser sound during the color wheel, sparkle chime when the mystery box appears. No speech.
Avoid: text, subtitles, watermark, extra or missing bottles, distorted logos, flicker, clutter.
```

### Teks dan audio yang ditambahkan saat editing

- Hook (0 sampai 2 detik): **"12 warna, 1 lucky box"**
- Tengah: **"Pick Your Lucky Box"**
- Akhir: **"Coba pilih, siapa tau dapat warna favoritmu! Eksklusif di Informa"** + logo Informa
- Harga dari video referensi (Rp 129.000 untuk 250ml, Rp 99.000 untuk 180ml) hanya dipakai bila sudah dipastikan per SKU.
- Musik: pakai lagu trending dari library TikTok / Reels yang berlisensi komersial, atau biarkan musik Veo.

---

## Tips agar hasil Veo lebih stabil

1. Generate 3 sampai 4 variasi per klip lalu pilih yang terbaik. Jumlah botol sering meleset, hitung ulang tiap hasil.
2. Jika botol bertambah atau berkurang, tambahkan kalimat `exactly twelve bottles, no more, no fewer` dan kurangi gerakan kamera.
3. Warna paling aman jika foto referensi dijadikan frame awal dan prompt menyebut warna yang sama.
4. Untuk Video 1, jika tangan tampak aneh, perpendek aksi per klip (satu aksi utama per klip).
5. Pastikan semua video akhir dicek oleh tim MD dan VM sebelum dipakai internal atau publik, karena detail logo dan produk bisa berbeda dari aslinya.
