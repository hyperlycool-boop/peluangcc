# Ruang Peluang
Website pembelajaran matematika berbahasa Indonesia: **Peluang Suatu Kejadian dan Peluang Kejadian Majemuk**. Next.js App Router + TypeScript strict. Cakupan saat ini: Pertemuan 1–5 (lima materi, tiga latihan, daftar referensi, laporan).

```sh
npm install
npm run dev
```
Buka http://127.0.0.1:3000. Halaman: `/` (beranda), `/materi/[slug]` (5 materi), `/latihan`, `/referensi`, serta `/styleguide` dan `/prototype` untuk pengembang.

```sh
npm test               # 114 tes unit (Vitest)
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
Hasil tersimpan di `docs/pengujian-final.json` dan `docs/screenshots/final-*.png`. Skrip `test:e2e` dan `test:prototype` memakai port 3000 dan menimpa tangkapan layar tahap awal; skrip itu sudah diperbarui untuk menu enam tautan tetapi belum dijalankan ulang.

Dokumen: `docs/LAPORAN_PROYEK_WEBSITE_PEMBELAJARAN.md` (laporan, BAB I–VII), `docs/DRAF_PERTEMUAN_1.md`, `docs/ARSITEKTUR.md`, `docs/VERIFIKASI.md`, `docs/REVISI_HOMEPAGE.md`. Salinan laporan untuk diunduh ada di `public/laporan-awal.md`; salinan itu harus disinkronkan setiap laporan berubah, dan gambar pada salinan hanya tampil dari folder `docs/`.

Status: belum dipublikasikan. Identitas (nama, kelas, guru, sekolah), masukan guru, dan pembagian tugas pada laporan masih bertanda **[ISI]**; daftar lengkapnya ada di Lampiran H laporan. Build pertama membutuhkan jaringan untuk font Google; runtime menyajikan font secara lokal.
