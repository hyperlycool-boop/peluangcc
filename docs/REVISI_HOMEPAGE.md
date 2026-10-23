# Revisi homepage — 23 Oktober 2026
Urutan: pembuka teks → diagram himpunan interaktif → daftar lima materi. Setiap materi memiliki rute /materi/[slug], penjelasan, rumus, contoh, dan pembahasan latihan singkat.

Pratinjau SVG muncul pada hover dan fokus keyboard. Pada perangkat tanpa hover, diagram tampil langsung. Animasi sekali jalan: kemunculan titik, perubahan komplemen, penelusuran grafik, pergeseran lingkaran, dan penelusuran pohon. CSS berada di app/globals.css; SVG di components/MaterialDiagram.tsx. Mode Tenang/Fokus dan prefers-reduced-motion menonaktifkan animasi. Grafik frekuensi adalah ilustrasi tren, bukan data percobaan.

Build produksi dan TypeScript lulus. tests/homepage.mjs lulus untuk lima hover, lima rute materi dan pembahasan, fokus keyboard, serta ukuran 360/768/1440 tanpa overflow atau galat JavaScript. Bukti: docs/screenshots/homepage-*.png. Halaman materi merupakan pengantar; simulator lanjutan tetap mengikuti rencana proyek awal.
