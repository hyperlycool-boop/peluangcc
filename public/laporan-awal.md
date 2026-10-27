# LAPORAN PROYEK WEBSITE PEMBELAJARAN
# Ruang Peluang
**Matematika — Peluang Suatu Kejadian dan Peluang Kejadian Majemuk**

Dokumen tahap awal: Phase 0 & Pertemuan 1. Disusun 23 Oktober 2026.
Nama anggota kelompok, guru pembimbing, dan sekolah: belum diberikan. Kelas acuan: XII / X. Tahun pelajaran acuan: 2025/2026, menunggu konfirmasi identitas proyek. Identitas ini harus dilengkapi sebelum pengumpulan resmi.

# BAB I — PENDAHULUAN
## 1.1 Latar Belakang
Belajar peluang membutuhkan pemahaman tentang semua hasil yang mungkin dan hasil yang memenuhi syarat suatu kejadian. Menghafal rumus tanpa memahami ruang sampel dapat menghasilkan jawaban keliru, khususnya pada gabungan yang memiliki irisan. Ruang Peluang menggunakan himpunan titik dan manipulasi skenario agar setiap hasil yang dihitung dapat diperiksa langsung.

## 1.2 Rumusan Masalah
Bagaimana siswa menentukan ruang sampel yang tepat? Bagaimana diagram menunjukkan perbedaan gabungan, irisan, dan komplemen? Bagaimana membedakan saling lepas, independensi, dan ketergantungan? Bagaimana menyediakan latihan serta evaluasi yang menjelaskan alasan matematis?

## 1.3 Tujuan
Menyediakan pembelajaran visual berbahasa Indonesia, menghubungkan rumus dan anggota himpunan, mengembangkan percobaan empiris, serta menyediakan penjelasan bertahap dan dokumentasi proyek yang dapat ditinjau guru.

## 1.4 Manfaat
Siswa dapat menguji dugaan melalui perubahan skenario. Guru memperoleh alat demonstrasi dan rujukan materi. Pengembang berlatih memisahkan model matematika dari antarmuka dan memeriksa hasil secara otomatis.

## 1.5 Sasaran Pengguna
Siswa SMA/SMK X–XII, siswa SMP IX pada materi pengantar, serta guru matematika. Antarmuka menyediakan kontrol keyboard, label bahasa Indonesia, dan pengurangan gerak untuk kebutuhan aksesibilitas.

# BAB II — PERENCANAAN MATERI (PERTEMUAN 1)
## 2.1 Mata Pelajaran dan Topik
Matematika: peluang suatu kejadian dan peluang kejadian majemuk. Nama website adalah Ruang Peluang. Lingkup dibatasi pada ruang sampel berhingga; peluang klasik dipakai ketika hasil elementer sama mungkin.

## 2.2 Alasan Pemilihan Materi
Koin, dadu, bola, kartu, serta susunan tempat duduk menawarkan konteks konkret. Diagram Venn memudahkan pemeriksaan tumpang tindih. Simulasi empiris yang direncanakan memperlihatkan variasi acak, sehingga nilai harapan tidak disalahartikan sebagai hasil yang pasti.

## 2.3 Tujuan Pembelajaran
Siswa menyusun ruang sampel; menghitung peluang dan komplemen; menafsirkan frekuensi relatif serta harapan; menggunakan aturan penjumlahan dengan benar; membedakan independensi dan kondisi; serta mengomunikasikan alasan solusi tiga latihan kontekstual.

## 2.4 Daftar Materi/Submateri
1. Percobaan, ruang sampel, titik sampel, dan kejadian.
2. Peluang klasik dan komplemen.
3. Frekuensi relatif serta harapan.
4. Saling lepas dan tidak saling lepas.
5. Saling bebas dan bersyarat.

Latihan: kantong 15 bola; kartu As atau King dari 52 kartu; dan delapan orang berbeda duduk di meja bundar. Detail perencanaan terdapat pada DRAF_PERTEMUAN_1.md.

## 2.5 Rencana Sumber Referensi
Modul Kemendikbud menjadi rujukan konteks sekolah; OpenStax menjadi rujukan pembanding definisi. Setiap sitasi memiliki ID, penulis, tahun, judul, penerbit, URL, tanggal akses, cakupan, dan status pemeriksaan. Metadata awal telah ditemukan, sedangkan audit klaim per halaman belum dilakukan. Penelusuran metadata bukan pengesahan seluruh materi.

# Lampiran tahap awal
## Bagian C — Lembar Catatan Setiap Pertemuan
| Pertemuan | Kegiatan dan hasil | Kendala | Masukan dan rencana perbaikan | Status |
|---|---|---|---|---|
| 1 | Draf terpisah, BAB I–II, Next.js/TypeScript, token desain, /styleguide, Venn dadu | Identitas belum diberikan; audit isi sumber belum selesai | Lengkapi identitas, lanjutkan sitemap serta audit pada tahap terkait | Selesai untuk ruang lingkup tahap 1; 6 tes, build, dan uji Chrome responsif lulus |
| 2 | Sitemap dan wireframe terperinci | Belum dikerjakan | Peta halaman dan alur belajar | Direncanakan |
| 3 | Materi 1–3 dan prototipe | Belum dikerjakan | Tangkap layar desktop dan ponsel | Direncanakan |
| 4 | Materi 4–5, latihan, audit | Belum dikerjakan | Validasi rumus, sumber, dan konvensi meja bundar | Direncanakan |
| 5 | Kuis, laporan akhir, pengujian | Belum dikerjakan | Uji lintas ukuran dan evaluasi guru | Direncanakan |

## Dokumentasi fondasi
Tangkapan layar tahap ini tersimpan di docs/screenshots/foundation-1440.png, foundation-768.png, foundation-360.png, dan styleguide-1440.png. Lihat VERIFIKASI.md untuk bukti dan batas pengujian. Ini bukan dokumentasi prototipe Pertemuan 3 maupun final Pertemuan 5.

## Kendala dan batas tahap
Belum ada simulasi Monte Carlo, lima halaman materi lengkap, solver tiga latihan, kuis, laporan BAB III–VII, atau publikasi. Bagian rencana di antarmuka diberi status yang jelas. Belum ada uji pembelajaran bersama siswa maupun persetujuan guru. Tidak ada nilai rubrik yang diklaim telah tercapai.

## Koreksi matematika yang dibawa ke tahap berikutnya
Saling lepas berarti n(A ∩ B) = 0. Kejadian adalah himpunan bagian S, termasuk kemungkinan A = S. Diagram Venn tahap ini menyatakan keanggotaan, bukan luas proporsional probabilitas. Ganjil dan prima pada dadu beririsan {3,5}; gabungannya {1,2,3,5}. Ganjil dan genap saling lepas.

## Daftar pustaka awal
Supriyati, R. D. (2019). E-modul matematika kelas XII: peluang kejadian majemuk. Kementerian Pendidikan dan Kebudayaan. https://repositori.kemendikdasmen.go.id/20980/. Diakses 23 Oktober 2026.

OpenStax. (2023). Introductory Statistics 2e: 3.2 Independent and Mutually Exclusive Events. Rice University. https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events. Diakses 23 Oktober 2026.
