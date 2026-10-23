# Arsitektur fondasi
Next.js App Router, TypeScript strict, Tailwind CSS 4 beserta token CSS, KaTeX, Motion, lucide-react. Font Sofia Sans dan JetBrains Mono melalui next/font/google: diunduh saat build, dilayani lokal saat runtime.

## Model data
lib/math.ts memisahkan SampleSpace (ID, outcomes unik, equallyLikely), ProbabilityEvent (ID, label, members subset), dan SimulationState (seed, trials, successes, history). SimulationState hanya kontrak tahap awal; RNG dan simulator dibuat pada Pertemuan 3. Operasi union/intersection/complement bekerja pada himpunan valid. probability memvalidasi ruang dan kejadian sebelum membagi jumlah anggota. Model berbobot harus ditambahkan sebelum mendukung eksperimen tidak seragam.

lib/citations.ts berisi Citation dengan status pemeriksaan eksplisit. Tes memastikan struktur dasar, bukan membuktikan kebenaran sumber eksternal. Audit akademik tetap pekerjaan terpisah.

## Arsitektur laporan
Sumber resmi: docs/LAPORAN_PROYEK_WEBSITE_PEMBELAJARAN.md. public/laporan-awal.md adalah salinan unduhan, disinkronkan ketika isi berubah. Halaman /laporan pada Pertemuan 5 direncanakan merender Markdown dengan heading, tabel, gambar relatif, serta CSS cetak. Belum ada mesin ekspor PDF. Tangkapan layar diberi nama sesuai tahap agar tidak tertukar dengan bukti final.

## Inventaris animasi
| Visual | Lokasi | Pemicu | Token | Mode tenang/fokus/reduced motion |
|---|---|---|---|---|
| Jalur orbit hero | components/Experience.tsx, motion.path | Halaman dimuat | orbit 1,2 s | Langsung lengkap; hero disembunyikan di Fokus |
| Lingkaran Venn | components/Experience.tsx, motion.circle | Pilih skenario | diagram 0,65 s | Langsung ke posisi akhir |
| Titik sampel | components/Experience.tsx, motion.g | Pilih skenario | diagram 0,65 s | Langsung ke posisi akhir |
| Sorotan kejadian dan formula | components/Experience.tsx | Pilih A ∪ B, A ∩ B, Aᶜ | instant | Tetap interaktif tanpa animasi |

Tidak ada gerak ambient berulang. Orbit dekoratif menegaskan hubungan dua himpunan; animasi titik menunjukkan pengelompokan ulang dan tidak mengubah nilai probabilitas. Kontrol seluruhnya tombol keyboard. GSAP/Lenis belum diperlukan untuk fondasi; scrollytelling baru dibuat pada tahap prototipe.
