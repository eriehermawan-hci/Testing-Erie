# Prompt VEO (Gemini): Blind Box Thermal "Pick Your Lucky Box"

Dua video, **masing-masing 8 detik (1 klip)**, format **9:16 vertikal**.
Prompt dalam bahasa Inggris karena Veo paling akurat dengan itu. Teks Indonesia (caption, harga, CTA) **ditambahkan saat editing**, jangan diminta dari Veo karena teks di video AI sering rusak.

## Catatan teknis

| Hal | Rekomendasi |
|---|---|
| Model | Veo 3.1 (atau Veo 3) di Gemini / Flow, durasi 8 detik, rasio 9:16. |
| Mode | **Image to video**: foto sebagai frame awal. Untuk Video 2 bisa **Ingredients to video** (sampai 3 foto referensi). |
| Video referensi | Veo tidak bisa memakai video orang lain sebagai referensi. Gayanya sudah diterjemahkan jadi kata-kata. Jangan pakai wajah staf asli sebagai input. |
| Teks pada botol dan box | Tidak ada tulisan ukuran atau label pada botol. Logo "informa" pada box bisa bergeser sedikit, pilih hasil terbaik dari beberapa variasi. |
| Audio | Musik dan efek suara saja. Voice over ditambahkan saat editing. |
| Variasi | Generate 3 sampai 4 kali, pilih yang jumlah botolnya benar. |

**Negative prompt** (kolom negative, atau di akhir prompt setelah "Avoid:"):

```
text, letters, numbers, size labels, subtitles, captions, watermark, extra bottles, missing bottles, merged bottles, deformed hands, extra fingers, melted or warped logos, blurry, low resolution, cartoon, 3D render look, overexposed, flicker
```

## Warna 12 botol (dipakai di kedua video)

Cocokkan dengan foto sebelum generate.

**6 botol slim, tanpa handle:** candy pink, sage green, lilac (paling tinggi), sky blue, periwinkle, lemon yellow.

**6 botol wide-mouth dengan loop handle:** charcoal grey, aqua dengan loop biru, cream white dengan loop biru, hot pink dengan loop kuning, lavender dengan loop hitam, marigold yellow dengan tutup dan loop oranye.

Semua botol matte soft-touch, warna pastel solid, **polos tanpa tulisan apa pun**. Box produk: holographic iridescent pink, kuning, dan biru pastel dengan tulisan "mini Flask series" dan logo "informa".

---

# VIDEO 1: Ilustrasi cara display sesuai guidance (8 detik)

**Tujuan:** menunjukkan urutan: endcap full, buka kardus display pelan-pelan, Secret diamankan, botol didisplay di riser, POP terpasang.
**Input:** foto display endcap Anda sebagai frame awal.

```
Vertical 9:16, realistic instructional retail video, starting exactly from the provided photo of a store endcap in a bright modern Indonesian department store: twelve colorful matte pastel bottles on a glass riser shelf at the top, three lower shelves completely full of pink holographic display boxes of the "mini Flask series", wooden back panel, clean tiled floor. All bottles are plain with no printed text.

Timeline:
0 to 2 seconds: the camera slowly pushes in on the full, tidy endcap. A female Indonesian store staff member in her 20s, wearing a navy blue Informa retail uniform with orange and yellow trim and a light grey hijab, walks into frame from the left carrying two pink holographic display cartons, one smaller and one larger.
2 to 5 seconds: close-up, she very slowly and gently opens one carton by lifting the front panel with both hands so the cardboard structure stays intact, and takes out the small product boxes. They reveal pastel bottles in different colors. One box reveals a special sparkling secret bottle, she smiles, closes that box and sets it aside in a small grey tote to keep it safe, leaving five colored bottles in her hands.
5 to 8 seconds: she places the opened bottles neatly on the glass riser shelf next to the others, slides a printed A4 sign into the holder at the front edge of the riser, steps back and gives a small thumbs up while the camera pulls back to the original wide photo composition: a complete, tidy, fully stocked endcap.

Soft bright retail lighting, steady smooth camera, natural colors, realistic hand movement, shallow depth of field on the background shelves.
Audio: light upbeat instructional background music, soft cardboard unfolding sound, gentle sparkle chime when the secret bottle appears, soft taps of bottles on glass. No speech.
Avoid: text, letters, size labels, subtitles, watermark, torn cardboard, rough or fast opening, extra or missing bottles, distorted logos, empty shelves.
```

**Caption saat editing (4 pop-up, sekitar 2 detik masing-masing):**
1. "Display di Endcap Area Thermal, full terisi"
2. "Buka kardus display pelan-pelan"
3. "Dapat Secret? Amankan dulu, display 5 warna"
4. "Pasang media komunikasi atau POP A4 dari MD"

---

# VIDEO 2: Konten 12 botol, kekinian (8 detik)

**Konsep:** "12 warna, 1 lucky box." Pastel pop, ritme cepat mengikuti beat, ASMR unboxing, dan finale lingkaran warna yang memuaskan dilihat. Cocok untuk Reels, TikTok, dan Shorts.
**Input:** foto 12 botol (foto display Anda). Gaya dari video referensi: unboxing seru, warna cerah, reaksi spontan, penutup "eksklusif hanya di Informa", dinaikkan menjadi lebih sinematik dan product-first.

```
Vertical 9:16, premium Gen-Z social media commercial, hyper-clean pastel pop aesthetic, ASMR product video, using the provided photo as the reference for the twelve bottles. All bottles are matte soft-touch, plain, with no printed text.

Timeline:
0 to 1.5 seconds: macro shot, manicured hands gently tear open a pink holographic iridescent display carton, rainbow light sweeps across the shimmering box surface.
1.5 to 4.5 seconds: hard match-cut to a smooth pastel gradient studio with stepped white pedestals, twelve bottles pop into frame one by one in rhythm with the beat, each landing with a small bounce. Six slim bottles in pink, sage green, lilac, sky blue, periwinkle and lemon yellow, and six wide-mouth bottles with carry loops in charcoal grey, aqua, cream white, fuchsia, lavender and marigold.
4.5 to 6.5 seconds: the camera makes a smooth orbit around the group, showing the matte texture, caps and loop handles, soft rim light, tiny sparkles in the air.
6.5 to 8 seconds: quick transition to a top-down view, the twelve bottles form a rotating color wheel from pink to yellow to green to blue to lavender, a single glowing mystery gift box with a sparkling question mark rises in the center, leaving clean empty space in the lower third of the frame for a logo.

Shallow depth of field, crisp colors, bright soft lighting, trendy modern look, smooth 24fps cinematic motion.
Audio: trendy upbeat lo-fi pop beat with a clear rhythm, crisp ASMR cardboard tear, bubbly pop for each bottle landing, soft whoosh on transitions, sparkle chime on the final reveal. No speech.
Avoid: text, letters, size labels, subtitles, watermark, extra or missing bottles, merged bottles, distorted logos, flicker, dark scenes.
```

**Teks dan audio saat editing**
- Detik 0 sampai 2: "12 warna, 1 lucky box"
- Detik 2 sampai 6: "Pick Your Lucky Box"
- Detik 6 sampai 8: "Coba pilih, siapa tau dapat warna favoritmu! Eksklusif di Informa" + logo Informa
- Harga dari video referensi (Rp 129.000 untuk 250ml, Rp 99.000 untuk 180ml) hanya dipakai bila sudah pasti per SKU.
- Musik: pakai musik Veo, atau lagu trending berlisensi komersial dari library TikTok / Reels.

---

## Tips

1. Jika jumlah botol meleset, tambahkan `exactly twelve bottles, no more, no fewer` dan kurangi gerakan kamera.
2. Jika tangan atau gerakan tampak aneh di Video 1, kurangi aksi: hapus bagian "thumbs up" atau bagian secret, lalu tambahkan lewat editing.
3. Semua video akhir dicek tim MD dan VM sebelum dipakai, karena detail logo dan produk bisa berbeda dari aslinya.
