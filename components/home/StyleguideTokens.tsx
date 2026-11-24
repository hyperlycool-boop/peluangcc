"use client";

import { ArrowUpRight } from 'lucide-react';

const SWATCHES = ['#F3F0EE', '#FCFBFA', '#141413', '#CF4500', '#F37338', '#EB001B', '#F79E1B'];

export default function StyleguideTokens() {
  return (
    <section className="tokens">
      <div className="eyebrow">SISTEM DESAIN / V0.1</div>
      <h2>Hangat. Jelas. Terukur.</h2>
      <div className="design-specimen">
        <span className="ghost-formula" aria-hidden="true">
          P(A)
        </span>
        <div className="portrait-circle">
          <span>
            Setiap titik,
            <br />
            sebuah kemungkinan.
          </span>
          <a href="#lab" className="satellite" aria-label="Coba diagram himpunan">
            <ArrowUpRight />
          </a>
        </div>
        <p>
          Potret konsep berbentuk lingkaran, tombol satelit 56 px, dan watermark rumus. Bentuk
          mengikuti makna himpunan.
        </p>
      </div>
      <div className="swatches">
        {SWATCHES.map((c) => (
          <div key={c}>
            <i style={{ background: c }} />
            <code>{c}</code>
          </div>
        ))}
      </div>
      <p>
        Sofia Sans: isi 450, judul 500, label 700. JetBrains Mono: penghitung. Radius: 20 px,
        40 px, 50%, 999 px.
      </p>
      <p>
        Gerak diagram 650 ms · jalur orbit 1.200 ms · Tenang, Fokus ujian, dan reduced motion
        menampilkan hasil secara langsung.
      </p>
    </section>
  );
}
