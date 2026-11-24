"use client";

import { useId, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { motionTokens } from '@/lib/math';

export default function HeroSection({
  styleguide,
  quiet,
  intro = false,
}: {
  styleguide: boolean;
  quiet: boolean;
  /** / and /prototype: the hero fills the first screen and fades away as the page scrolls. */
  intro?: boolean;
}) {
  const grainId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // Pass-through transform: opts out of Motion's native scroll-timeline acceleration, which drops the
  // fade once the hero is past its range. See FilmScene for the same fix.
  const leaving = useTransform(heroScroll, (value) => value);
  const fades = intro && !quiet;
  const copyOpacity = useTransform(leaving, [0, 0.6], [1, 0]);
  const copyY = useTransform(leaving, [0, 0.6], [0, -48]);

  return (
    <section
      ref={sectionRef}
      id="beranda"
      className={`hero ${!styleguide ? 'homepage-hero' : ''}${intro ? ' is-intro' : ''}`}
    >
      <motion.div
        className="hero-copy"
        style={fades ? { opacity: copyOpacity, y: copyY } : undefined}
      >
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
      </motion.div>

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
