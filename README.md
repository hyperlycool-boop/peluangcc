# Ruang Peluang
Website pembelajaran matematika berbahasa Indonesia: **Peluang Suatu Kejadian dan Peluang Kejadian Majemuk**. Next.js App Router + TypeScript strict. Cakupan saat ini: Pertemuan 1–5 (lima materi, tiga latihan dengan visualisasi interaktif, daftar referensi, laporan).

```sh
npm install
npm run dev
```
Buka http://127.0.0.1:3000. Halaman: `/` (beranda: hero layar penuh, film dadu enam tahap, lab diagram Venn, daftar materi), `/materi/[slug]` (5 materi; tiga soal latihan ada di materi Ruang sampel dan Kejadian majemuk, uji pemahaman di setiap materi), `/playground` (taman bermain: dadu, koin, spinner), `/referensi`, serta `/styleguide` dan `/prototype` untuk pengembang. `/prototype` memakai desain yang sama dengan beranda, hanya kepala dan kaki halamannya yang berbeda.

```sh
npm test               # 431 tes unit (Vitest, 24 berkas)
npm run typecheck
npm run lint
npm run build
npm run validate:materi
```
`validate:materi` memeriksa model himpunan dadu; tes isi (jawaban latihan, rumus wajib, sumber) ada di `tests/content.test.ts` dan ikut `npm test`.

Pengujian final pada build produksi (tampilan 3 ukuran, tautan, jangkar, galat, tangkapan layar):
```sh
npm run build
npx next start -p 3200 --hostname 127.0.0.1
BASE_URL=http://127.0.0.1:3200 npm run test:final
```
Hasil tersimpan di `docs/pengujian-final.json` dan `docs/screenshots/final-*.png`. Skrip `test:e2e` dan `test:prototype` memakai port 3000 dan menimpa tangkapan layar tahap awal (`foundation-*`, `homepage-*`, `prototype-3d-folding-*`, `styleguide-1440`); kembalikan berkas itu dengan `git checkout -- docs/screenshots` setelah menjalankannya. Terakhir dijalankan 24 November 2026: `test:e2e`, `test:prototype`, dan `test:final` lulus.

Versi HTML statis (tanpa server Node; untuk hosting statis yang menyajikan situs dari akar domain):
```sh
npm run build:html     # menulis situs ke out/ (satu index.html per halaman, 404.html untuk halaman tidak ditemukan)
npm run preview:html   # menyajikan out/ di http://127.0.0.1:3300
npm run eval:export    # memeriksa halaman wajib, tautan, aset, dan jangkar di out/
```
`build:html` memakai `output: 'export'` di `next.config.ts` hanya bila `NEXT_STATIC_EXPORT=1`; `npm run build` biasa tidak berubah. Folder `out/` diabaikan git.

Batas hosting: URL aset dan tautan bersifat absolut (`/_next/...`, `/materi/...`) dan `basePath` tidak diatur, jadi `out/` hanya berjalan di akar domain. Subfolder seperti `nama.github.io/ruang-peluang/` dan pembukaan `index.html` lewat `file://` tidak berfungsi. GitHub Pages berbasis Jekyll juga membutuhkan berkas `.nojekyll` agar folder `_next/` tidak dibuang.

`BASE_URL=http://127.0.0.1:3300 npm run test:final` juga lulus pada versi ini (8 November 2026). Perintah itu menimpa bukti build produksi; kembalikan dengan `git checkout -- docs/pengujian-final.json 'docs/screenshots/final-*.png'` setelah menjalankannya.

Dokumen: `docs/LAPORAN_PROYEK_WEBSITE_PEMBELAJARAN.md` (laporan, BAB I–VII), `docs/DRAF_PERTEMUAN_1.md`, `docs/ARSITEKTUR.md`, `docs/VERIFIKASI.md`, `docs/REVISI_HOMEPAGE.md`. Salinan laporan untuk diunduh ada di `public/laporan-awal.md`; salinan itu harus disinkronkan setiap laporan berubah, dan gambar pada salinan hanya tampil dari folder `docs/`.

Status: belum dipublikasikan. Identitas (nama, kelas, guru, sekolah), masukan guru, dan pembagian tugas pada laporan masih bertanda **[ISI]**; daftar lengkapnya ada di Lampiran H laporan. Build pertama membutuhkan jaringan untuk font Google; runtime menyajikan font secara lokal.
