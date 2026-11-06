# Rancangan Website Ruang Peluang

Dokumen ini merangkum rancangan Ruang Peluang secara utuh: tujuan, pengguna, struktur, halaman, interaksi, sistem desain, arsitektur kode, pengujian, dan rencana lanjutan. Isinya disusun dari berkas proyek yang ada (kode di `app/`, `components/`, `lib/`, `tests/`, serta `PRODUCT.md`, `README.md`, dan dokumen di `docs/`) per 6 November 2026, termasuk perubahan yang belum di-commit pada cabang `feat/latihan-referensi-laporan`.

Dokumen ini melengkapi, bukan menggantikan, laporan resmi (`docs/LAPORAN_PROYEK_WEBSITE_PEMBELAJARAN.md`). Laporan mencatat apa yang terjadi per pertemuan; dokumen ini menjadi acuan satu halaman untuk mengembangkan situs selanjutnya.

---

## 1. Ringkasan

| Butir | Isi |
|---|---|
| Nama | Ruang Peluang — slogan "Lihat. Coba. Pahami." |
| Topik | Matematika: Peluang Suatu Kejadian dan Peluang Kejadian Majemuk |
| Bahasa | Bahasa Indonesia; rumus dirender KaTeX |
| Gagasan inti | Setiap hasil yang dihitung adalah titik yang terlihat pada model himpunan, sehingga rumus seperti P(A ∪ B) dapat dicocokkan dengan anggota A, B, dan irisannya |
| Lingkup | Ruang sampel berhingga; peluang klasik bila hasil elementer sama mungkin |
| Isi | 5 materi, 5 eksperimen, 13 rumus berlabel, 3 latihan berpembahasan, 4 sumber |
| Status | Belum dipublikasikan; identitas dan masukan guru masih bertanda **[ISI]** di laporan |

## 2. Pengguna dan Skenario Pakai

| Pengguna | Skenario | Konsekuensi rancangan |
|---|---|---|
| **Guru** (utama, dikonfirmasi di `PRODUCT.md`) | Mendemonstrasikan materi di kelas lewat proyektor atau layar besar, siswa mengikuti | Terbaca dari belakang kelas; satu gagasan per tampilan; tidak bergantung pada *hover*; Mode tampilan "Fokus ujian" untuk meredam gerak |
| **Siswa** (belajar mandiri) | Membuka materi berurutan, mencoba eksperimen, mengerjakan latihan | Pembahasan disembunyikan di balik "Lihat pembahasan" agar mencoba dulu; eksperimen dapat diulang |
| **Penilai proyek** | Memeriksa laporan dan bukti | Sumber dan status pemeriksaan tampil di situs; pengujian dapat diulang dengan satu perintah |

Ukuran keberhasilan (dari `PRODUCT.md`): siswa dapat menyatakan ruang sampel dengan benar, dan guru dapat menjalankan satu pelajaran dari situs.

## 3. Prinsip Rancangan

1. **Model himpunan adalah sumber kebenaran.** Setiap angka, jumlah, dan peluang yang tampil berasal dari model teruji di `lib/` dan tes isi. Tidak ada angka hiasan atau karangan.
2. **Tunjukkan alasan, bukan hanya jawaban.** Setiap hasil dapat ditelusuri ke titik sampel yang menghasilkannya.
3. **Layar bersama lebih dulu.** Terbaca dari jauh, satu gagasan per tampilan, tidak ada informasi yang hanya muncul saat *hover*.
4. **Jujur tentang yang belum selesai.** Hal yang belum dilakukan ditulis apa adanya; identitas dan masukan guru tidak dikarang.
5. **Gerak menjelaskan, bukan menghias.** Animasi menunjukkan pengelompokan ulang titik dan tidak pernah mengubah nilai. Tidak ada gerak ambient berulang.

## 4. Lingkup

| Termasuk | Tidak termasuk (keputusan lingkup) |
|---|---|
| Beranda, 5 halaman materi, halaman Referensi | Pencarian |
| Eksperimen interaktif per materi | Kuis berskor dan penyimpanan nilai |
| Latihan berpembahasan di halaman materi terkait | Halaman `/latihan` terpisah (dihapus; kini 404) |
| Mode tampilan (Interaktif penuh, Tenang, Fokus ujian) | Video, foto, atau gambar pihak ketiga |
| Laporan Markdown di `/laporan-awal.md` | Akun pengguna, *backend*, basis data |
| Halaman pengembang `/styleguide`, `/prototype` | Ruang sampel tak berhingga, peluang berbobot |

## 5. Arsitektur Informasi

### 5.1 Peta situs

```
Ruang Peluang
├── /                     Beranda
│   ├── #beranda          Hero "Peluang bukan sekadar angka."
│   ├── #dadu             Dadu yang Bergulir (dadu 3D mengikuti gulir, 4 tahap)
│   ├── #lab              Lab diagram himpunan (2 skenario × A∪B, A∩B, Aᶜ)
│   └── #materi           Daftar 5 materi + pratinjau + "Coba animasi"
├── /materi/[slug]        5 halaman materi
│   ├── ruang-sampel          + Latihan soal 3 (meja bundar)
│   ├── peluang-komplemen
│   ├── frekuensi-kejadian
│   ├── kejadian-majemuk      + Latihan soal 1 (bola) dan soal 2 (kartu)
│   └── bebas-bersyarat
├── /referensi            Daftar pustaka, status pemeriksaan, kredit perangkat lunak
├── /laporan-awal.md      Salinan unduhan laporan (belum ada tautan menu)
└── Pengembang: /styleguide, /prototype (tidak ada di menu utama)
```

### 5.2 Alur belajar

```
Beranda ──► Materi 1 ──► Materi 2 ──► Materi 3 ──► Materi 4 ──► Materi 5 ──► Referensi
  (dadu, lab Venn)  │ latihan 3                         │ latihan 1, 2
                    └── tombol ← sebelumnya / berikutnya → dengan transisi berarah
```

### 5.3 Navigasi

| Tempat | Isi |
|---|---|
| Header beranda | Beranda, Dadu 3D, Lab Diagram, Materi (jangkar dengan penanda bagian aktif), Referensi |
| Header halaman lain | Logo (ke beranda), Materi, Referensi, dengan penanda halaman aktif |
| Footer | Materi, Referensi, slogan |
| Antar materi | "← sebelumnya" dan "berikutnya →" dengan *view transition* searah |
| Aksesibilitas | Tautan lewati navigasi di beranda |
| Layar ≤ 760 px | Menu pindah ke baris kedua yang dapat digeser |

## 6. Rancangan Halaman

### 6.1 Beranda (`app/page.tsx` → `components/Experience.tsx`)

| Bagian | Tujuan | Isi dan interaksi |
|---|---|---|
| Hero `#beranda` | Memancing rasa ingin tahu | Judul, subjudul "Lihat kemungkinan. Mainkan kejadiannya.", tombol "Mulai bereksplorasi", pilihan Mode tampilan, jalur orbit dua himpunan |
| Dadu `#dadu` | Memperkenalkan ruang sampel dadu | Dadu CSS 3D *sticky*; gulir menggerakkan 4 tahap (ambang 0,24 / 0,56 / 0,80 / 1,00 di `lib/scrolly.ts`) sampai dadu terbuka menjadi enam titik sampel |
| Lab `#lab` | Membedakan gabungan, irisan, komplemen | 01 Pilih skenario (A ganjil & B prima, atau A ganjil & B genap); 02 Sorot kejadian (A∪B, A∩B, Aᶜ); hasil {…} dan P = …/6 dengan angka bergulir |
| Materi `#materi` | Pintu masuk ke lima materi | Daftar bernomor, pratinjau diagram saat sorot/fokus, "Pelajari" ke halaman materi, "Coba animasi" membuka eksperimen di tempat |

### 6.2 Halaman materi (`app/materi/[slug]/page.tsx`)

Urutan blok sama untuk kelima materi, sesuai konsep *eksperimen → rumus → contoh → pertanyaan → latihan → sumber*:

```
+------------------------------------------------+
| Header: logo · Materi · Referensi              |
+------------------------------------------------+
| Judul materi (morph dari daftar beranda)       |
| Pengantar                                      |
| [ Jadikan konsepnya terlihat. ]                |
|   eksperimen interaktif materi ini             |
| Hubungkan dengan rumus.                        |
|   kartu rumus berlabel × n                     |
| Contoh                                         |
| Coba pikirkan.  pertanyaan ▸ Lihat pembahasan  |
| Latihan (bila ada)  soal ▸ Lihat pembahasan    |
|   langkah demi langkah + jawaban akhir         |
| Sumber  daftar · status · catatan              |
| ← materi sebelumnya       materi berikutnya →  |
+------------------------------------------------+
| Footer                                         |
+------------------------------------------------+
```

Perubahan terbaru (belum di-commit): label "MATERI 0x / 05" di atas judul dan nomor "LATIHAN 0x" pada kartu latihan dihapus; logo header kini memakai simbol dua lingkaran dan titik berwarna.

### 6.3 Referensi (`app/referensi/page.tsx`)

Daftar empat sumber bernomor (penulis, tahun, judul, penerbit, URL, tanggal akses), masing-masing dengan status pemeriksaan, kegunaan, keterangan, dan tautan balik ke materi yang memakainya. Di bawahnya: kredit ilustrasi/diagram/simulasi (semua buatan sendiri), perangkat lunak dan huruf beserta lisensinya, dan arti status.

### 6.4 Halaman pengembang

`/styleguide` mendokumentasikan token dan komponen; `/prototype` menyimpan prototipe efek dadu 3D. Keduanya tidak termasuk pengalaman belajar dan hanya dibuka lewat alamat langsung; tautannya tidak tampil di header atau footer beranda.

## 7. Rancangan Isi

| No. | Materi (`lib/materials.ts`) | Rumus berlabel | Eksperimen | Latihan (`lib/exercises.ts`) | Sumber |
|---|---|---|---|---|---|
| 1 | Ruang sampel | S dan A; A ⊆ S | Meja bundar 8 kursi: acak susunan duduk, hitung susunan berselang-seling | Soal 3: 8 orang duduk berselang-seling di meja bundar → 1/35 | lembar-guru, openstax-3-1 |
| 2 | Peluang & komplemen | P(A) = n(A)/n(S); 0 ≤ P(A) ≤ 1; P(Aᶜ) = 1 − P(A) | Pilih titik dadu, lihat A dan Aᶜ mengisi S | — | lembar-guru, openstax-3-1 |
| 3 | Frekuensi kejadian | Frekuensi relatif (pecahan, persen); frekuensi harapan | Lempar koin hingga 1.000 kali, grafik frekuensi relatif mendekati 1/2 | — | lembar-guru, openstax-3-1 |
| 4 | Kejadian majemuk | Tidak saling lepas; saling lepas (A ∩ B = ∅) | 15 bola, 52 kartu, dan kasus As atau Hati; pilih gabungan/irisan | Soal 1: bola merah atau hijau → 11/15; Soal 2: As atau King → 2/13 | lembar-guru, openstax-3-2, kemdikbud-2019 |
| 5 | Bebas & bersyarat | P(B \| A) = P(A ∩ B)/P(A); aturan perkalian; saling bebas | Ambil dua bola dengan dan tanpa pengembalian | — | lembar-guru, openstax-3-2, kemdikbud-2019 |

Aturan isi:
- Setiap rumus punya label agar tidak tertukar (misalnya "Saling lepas (A ∩ B = ∅)").
- Konvensi yang bisa diperdebatkan dinyatakan di soal (meja bundar: putaran dianggap sama).
- Koreksi terhadap sumber dicatat, misalnya salah ketik "n(A ∩ B) ≠ 0" pada lembar guru; situs memakai n(A ∩ B) = 0.
- Sumber yang baru diperiksa metadatanya (e-modul Kemendikbud) ditandai jujur sebagai "Metadata diperiksa".

## 8. Rancangan Interaksi

### 8.1 Pola umum eksperimen
1. Siswa melakukan tindakan (pilih titik, lempar, ambil, acak).
2. Titik sampel berpindah atau tersorot sesuai tindakan.
3. Rumus dan angka di sampingnya ikut berubah, dihitung dari model yang sama.
4. Hasil diumumkan ke pembaca layar lewat `aria-live`.
5. Eksperimen dapat diulang; hasil acak berbeda tiap kali, sehingga nilai harapan tidak disangka pasti.

### 8.2 Mode tampilan (`lib/display-mode.ts`)

| Mode | Perilaku |
|---|---|
| Interaktif penuh | Semua gerak aktif |
| Tenang | Gerak langsung ke posisi akhir; transisi halaman diredam |
| Fokus ujian | Seperti Tenang, dan hero disembunyikan |

Mode disimpan di `sessionStorage` dan ditandai `data-motion="quiet"` pada `<html>`. Pengaturan *reduced motion* perangkat diperlakukan setara dengan Tenang.

### 8.3 Inventaris gerak

| Gerak | Durasi/pegas | Pemicu |
|---|---|---|
| Jalur orbit hero | 1,2 s | Halaman dimuat |
| Lingkaran Venn dan titik sampel | 0,65 s, kurva `ease-luxury` | Ganti skenario |
| Sorotan kejadian | Seketika | Pilih A∪B, A∩B, Aᶜ |
| Angka peluang bergulir | Pegas (`lib/interactive-formula.ts`) | Nilai berubah |
| Dadu 3D gulir | Mengikuti posisi gulir | Gulir halaman |
| Transisi antar halaman | *View transition* berarah, morph judul materi | Navigasi |

## 9. Sistem Desain

### 9.1 Warna (`app/globals.css`)

| Token | Nilai | Fungsi |
|---|---|---|
| `--canvas` | `#F3F0EE` | Latar krem hangat |
| `--lifted` | `#FCFBFA` | Kartu rumus dan eksperimen |
| `--ink` | `#141413` | Teks |
| `--signal` | `#CF4500` | Aksen: hasil terpilih, tombol utama, tautan aktif |
| `--light` | `#F37338` | Aksen terang |
| Himpunan A / B | `#EFB3A3` / `#F6CF7B`, *multiply* | Irisan tampak sebagai warna ketiga |

### 9.2 Tipografi, bentuk, ikon
- Sofia Sans (isi 450, judul 500, label 700); JetBrains Mono untuk angka agar penghitung tidak bergeser. Dilayani lokal lewat `next/font`.
- Sudut: kartu 20 px, stadion 40 px, lingkaran 50%, pil 999 px.
- Ikon Lucide (panah). Tanpa foto; semua ilustrasi SVG/CSS buatan sendiri.

### 9.3 Kurva gerak
`--ease-out`, `--ease-luxury` (0.16, 1, 0.3, 1), `--ease-in-out`, `--ease-drawer`.

## 10. Arsitektur Teknis

### 10.1 Teknologi
Next.js 16 App Router, React 19, TypeScript *strict*, Tailwind CSS 4 + token CSS, KaTeX, Motion, Lenis, lucide-react. Pengujian: Vitest, ESLint, Playwright. Seluruh situs statis (12 rute dibangun saat build, termasuk `/icon.svg` dan halaman 404); tidak ada *backend*.

### 10.2 Lapisan

```
┌───────────── Rute (app/) ─────────────┐
│ page.tsx  materi/[slug]  referensi     │  menyusun halaman, tanpa logika hitung
└───────────────┬────────────────────────┘
                ▼
┌──────── Komponen (components/) ───────┐
│ Experience  LessonExperiments          │  tampilan dan interaksi
│ ExerciseExperiments  ExerciseCard      │
│ Formula  RollingNumber  Die3D          │
│ ScrollScene3D  SiteChrome  SourceCredits│
└───────────────┬────────────────────────┘
                ▼
┌──────── Model dan isi (lib/) ─────────┐
│ math.ts               himpunan, peluang│  murni, teruji unit
│ materials.ts  exercises.ts  citations  │  isi sebagai data
│ exercise-visualization  experiment-    │
│ motion  scrolly  folding  interactive- │
│ formula  display-mode  route-transition│
└────────────────────────────────────────┘
```

Aturan lapisan: komponen tidak menghitung peluang sendiri. Semua angka diambil dari fungsi di `lib/`, dan fungsi itu diuji di `tests/`.

### 10.3 Model data

| Tipe | Berkas | Isi |
|---|---|---|
| `SampleSpace` | `lib/math.ts` | `id`, `outcomes` unik, `equallyLikely: true` |
| `ProbabilityEvent` | `lib/math.ts` | `id`, `label`, `members` ⊆ outcomes |
| `Material` | `lib/materials.ts` | `slug`, judul, pengantar, `formulas[]` berlabel, contoh, pertanyaan, jawaban, `sources[]` |
| `Exercise` | `lib/exercises.ts` | `id`, `lessonSlug`, soal, `steps[]` (teks + TeX), jawaban |
| `Citation` | `lib/citations.ts` | ID, penulis, tahun, judul, URL, tanggal akses, cakupan, status pemeriksaan, catatan |
| `CompoundScenario` | `lib/exercise-visualization.ts` | Item dan kejadian untuk soal 1, soal 2, As atau Hati |
| `DisplayMode` | `lib/display-mode.ts` | `full` \| `calm` \| `focus` |

`probability()` menolak ruang sampel kosong atau tidak unik dan kejadian yang bukan himpunan bagian. Model berbobot belum ada dan harus ditambahkan sebelum mendukung eksperimen tidak seragam.

### 10.4 State
Hanya state lokal komponen (pilihan skenario, hasil lemparan) dan Mode tampilan di `sessionStorage` yang dibagikan lewat `useSyncExternalStore`. Tidak ada state server.

## 11. Aksesibilitas

- Tautan lewati navigasi; seluruh kontrol berupa tombol yang dapat dioperasikan keyboard.
- Tombol pilihan memakai `aria-pressed`; diagram punya label ARIA; hasil dibacakan lewat `aria-live`.
- Label dan pesan galat dalam bahasa Indonesia.
- Mode Tenang/Fokus dan *reduced motion* menampilkan hasil akhir tanpa animasi.
- Rumus panjang dapat digulir mendatar di dalam kartunya pada layar sempit.

## 12. Strategi Pengujian

| Lapisan | Alat | Cakupan |
|---|---|---|
| Model matematika | Vitest (`tests/math.test.ts`) | Aturan penjumlahan untuk semua 4.096 pasangan himpunan bagian ruang sampel dadu |
| Isi | `tests/content.test.ts` | Jawaban latihan dihitung ulang dengan enumerasi (15 bola, 52 kartu, 5.040 susunan duduk); rumus wajib per materi; sumber terdaftar |
| Visualisasi | `tests/exercise-visualization.test.ts`, `experiment-motion`, `interactive-formula`, `folding-kinematics`, `display-mode`, `route-transition` | Angka visualisasi terikat ke jawaban; kinematika dan state gerak |
| Kualitas kode | `npm run typecheck`, `npm run lint` | 0 galat |
| Build produksi | `npm run test:final` (Playwright) | 7 halaman × 3 lebar (1440/768/375), 14 tautan, 7 jangkar, 404, render KaTeX, galat JS; hasil di `docs/pengujian-final.json` |
| Regresi tahap awal | `tests/browser.mjs`, `homepage.mjs`, `prototype.mjs` (port 3000) | Fondasi, beranda, prototipe 3D; menimpa tangkapan layar tahap awal, jadi kembalikan dengan `git checkout -- docs/screenshots` |

Total saat ini: 141 tes unit pada 8 berkas. Semua lapisan di atas terakhir dijalankan 6 November 2026 dan lulus.

## 13. Ketidaksesuaian yang Sudah Dirapikan (6 November 2026)

| Temuan | Perbaikan |
|---|---|
| `PRODUCT.md` menyebut rute `/latihan` yang sudah dihapus | Rute dihapus dari daftar; dicatat bahwa latihan ada di halaman materi dan `/latihan` mengembalikan 404 |
| `PRODUCT.md` menyebut 114 tes unit | Diubah menjadi 141 tes pada 8 berkas |
| Wireframe laporan (3.4) masih memuat "MATERI 04 / 05", "LATIHAN 01", eksperimen lama, dan tautan Sistem desain | Wireframe, peta situs, dan tabel halaman diperbarui; `public/laporan-awal.md` disinkronkan |
| Tangkapan layar final dibuat sebelum perubahan header dan latihan | `npm run test:final` dijalankan ulang; `docs/pengujian-final.json` dan `docs/screenshots/final-*.png` diperbarui; jumlah tautan 15 → 14 dicatat di laporan 6.4 |
| Skrip Playwright tahap awal belum dijalankan ulang | Ketiganya dijalankan dan lulus; pemilih `summary` di `tests/homepage.mjs` dipersempit; tangkapan layar tahap awal dikembalikan ke versi asli |

Yang masih terbuka: semua perubahan di atas belum di-commit.

## 14. Rencana Lanjutan

Disusun dari Bab 6.6 dan 7.2 laporan, diurutkan dari yang paling menentukan pengumpulan.

| Prioritas | Pekerjaan | Hasil yang diharapkan |
|---|---|---|
| 1 | Minta guru meninjau materi, rumus, dan tiga pembahasan | Masukan tercatat di Bab IV–V laporan; isian **[ISI]** terisi |
| 2 | Lengkapi identitas, pembagian tugas, dan tanggal di laporan | Lampiran H kosong |
| 3 | Commit perubahan pada cabang `feat/latihan-referensi-laporan` | Kode, dokumen, dan tangkapan layar final tercatat bersama |
| 4 | Periksa ejaan seluruh halaman; uji di Safari, Firefox, dan ponsel fisik | Baris "Ejaan" dan "Peramban" di 6.4 laporan lulus |
| 5 | Baca isi PDF e-modul Kemendikbud | Status sumber naik dari "Metadata diperiksa" ke "Isi diperiksa" |
| 6 | Publikasikan situs dan jalankan `npm run test:final` pada alamat publik | URL di 6.2 laporan |
| 7 | Tambahkan tautan unduhan laporan di footer | `/laporan-awal.md` dapat ditemukan tanpa alamat langsung |
| 8 | (Opsional) Kuis berskor dengan alasan jawaban, lalu uji dengan beberapa siswa | Bukti uji pengguna yang nyata |

Setiap penambahan isi baru mengikuti aturan yang sama: data di `lib/`, angka dibuktikan dengan tes enumerasi, sumber tercatat di `lib/citations.ts`, dan gerak menghormati Mode tampilan.
