"use client";

import { useId } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { motionTokens } from '@/lib/math';

export default function HeroSection({
  styleguide,
  quiet,
}: {
  styleguide: boolean;
  quiet: boolean;
}) {
  const grainId = useId();

  return (
    <section id="beranda" className={`hero ${!styleguide ? 'homepage-hero' : ''}`}>
      <div className="hero-copy">
        <h1>
          {styleguide ? 'Desain yang' : 'Peluang bukan'}
          <br />
          {styleguide ? 'membuat matematika' : 'sekadar'}{' '}
          <em>{styleguide ? 'bermakna.' : 'angka.'}</em>
        </h1>
        <p>
          Lihat kemungkinan. Mainkan kejadiannya.
          <br />
          Temukan alasan di balik setiap rumus.
        </p>
        <a className="button primary" href="#dadu">
          Mulai bereksplorasi <ArrowUpRight size={20} />
        </a>
      </div>

      {styleguide && (
        <div className="hero-art">
          <span className="art-tag">EKSPERIMEN 001 / HIMPUNAN</span>
          <svg
            viewBox="0 0 560 420"
            role="img"
            aria-label="Dua himpunan A dan B dengan irisan yang disorot"
          >
            <defs>
              <pattern id={grainId} width="7" height="7" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r=".5" fill="#fff" opacity=".25" />
              </pattern>
            </defs>
            <motion.path
              d="M 65 345 C -20 30 500 0 510 330"
              fill="none"
              stroke="#F37338"
              strokeWidth="1.5"
              strokeDasharray="5 7"
              initial={{ pathLength: quiet ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: quiet ? 0 : motionTokens.orbit }}
            />
            <circle cx="218" cy="200" r="129" fill="#d95636" />
            <circle
              cx="354"
              cy="200"
              r="129"
              fill="#f6b63b"
              style={{ mixBlendMode: 'multiply' }}
            />
            <circle cx="218" cy="200" r="129" fill={`url(#${grainId})`} />
            <text x="162" y="218" fill="white" fontSize="55" fontStyle="italic">
              A
            </text>
            <text x="378" y="218" fill="#513b11" fontSize="55" fontStyle="italic">
              B
            </text>
            <text x="270" y="208" fill="white" fontSize="23">
              ∩
            </text>
            <circle cx="470" cy="90" r="28" fill="white" />
            <text x="459" y="99" fontSize="24">
              ↗
            </text>
            <text x="44" y="55" fontSize="20" fill="#777">
              S
            </text>
          </svg>
          <div className="art-caption">
            <span>Ketika dua kemungkinan bertemu.</span>
            <span className="mono">A ∩ B</span>
          </div>
        </div>
      )}
    </section>
  );
}
