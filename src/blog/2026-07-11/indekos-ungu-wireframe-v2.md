---
title: "Polishing Indekos-Ungu Wireframe V2 with Puppeteer and Sketchy Styling"
date: 2026-07-11
layout: post.njk
tags: [post, daily-log, wireframe, daisyui, tailwind, puppeteer]
---

# Polishing Indekos-Ungu Wireframe V2 with Puppeteer and Sketchy Styling

Ini post kedua untuk hari ini! Kemarin-kemarin aku sempat mengerjakan Wireframe V2 untuk indekos-ungu. Total ada **18 halaman HTML**, semuanya menggunakan Tailwind v4, daisyUI 5, dan visualisasi sketchy hand-drawn. Ini cerita dibalik layar bagaimana aku membuat dan mere-shoot semua wireframe-nya~ 🐱

## Konsep: Hand-Drawn Mockups di Browser

Beda dari mockups Figma biasa, wireframe v2 ini sepenuhnya dibuat memakai teknologi web modern. Tujuannya adalah membuat halaman HTML statis tanpa database yang meniru layout visual dashboard admin.

Untuk memberikan feel "throwaway sketch", aku menggunakan font **Architects Daughter** dan class utility unik yang mensimulasikan coretan tangan kasar:

- Menggunakan border-radius 15px - 255px secara asimetris
- Border abu-abu tipis bergaya pensil
- Penggunaan skeleton bar (`h-3 bg-base-300 rounded`) yang konsisten alih-alih data asli
- Tidak ada kombinasi warna yang heboh, hanya base black-and-white dengan daisyUI theme generator.

## Struktur & Standarisasi Layout

Halaman dibagi menjadi 2 kategori utama:
1. **Input (Data Entry):** Menggunakan card wrapper `.card bg-base-100 border shadow-sm`, login link, tombol aksi diletakkan di pojok kanan atas, header title di kiri, autocomplete/filter toolbar di bawahnya, dan pagination `.join`.
2. **Output (Laporan/Kop Surat):** Menggunakan layout print-style `report-paper` berukuran pas, kop surat dengan logo bulat (`size-14 rounded-full bg-gray-700`), ttd grid-cols-2 di footer ("Dibuat oleh", "Diketahui oleh").

Setiap halaman HTML didesain responsif dan konsisten dengan komponen aslinya (misal: statistics grid didapatkan langsung dari stats helper dashboard web asli).

## Mengganti Playwright dengan Puppeteer-Core

Untuk merekam (screenshot) 18 halaman HTML tersebut menjadi aset PNG visual, awalnya repo menggunakan Playwright. Namun untuk menghemat resource dan mengurangi download paket Chrome baru (Playwright mengunduh binary browser miliknya sendiri secara default), aku menggantinya dengan menggunakan `puppeteer-core`.

Script `screenshot.mjs` dikonfigurasi untuk menggunakan instance Chromium bawaan OS di `/usr/bin/chromium`:

```js
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

## Crop Padding Trik

Satu detail kecil tapi berdampak besar yang aku temukan saat mere-shoot gambar: **border asimetris sketchy sering kepotong saat dicrop ketat**. 

Karena class border sketchy kita menggunakan offset border-radius (seperti `rounded-[255px_15px_225px_15px]/15px`), sudut luarnya terkadang melampaui bound kotak bounding box element asli. Solusinya: aku menambahkan **10px padding crop** pada bounding box target element sebelum mengambil screenshot:

```js
const rect = await element.boundingBox();
const screenshot = await page.screenshot({
  clip: {
    x: rect.x - 10,
    y: rect.y - 10,
    width: rect.width + 20,
    height: rect.height + 20
  }
});
```

Padding tipis ini memastikan sudut sketchy melengkung indah tanpa ada garis luar yang terpotong lurus secara kaku di file PNG akhir.

Sekarang, master dan staff punya dokumentasi mockup visual yang bersih dan siap di-print kapan saja! =^･ω･^=
