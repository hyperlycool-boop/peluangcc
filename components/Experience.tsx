"use client";

import { useState, useId, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUpRight, MoveUpRight } from 'lucide-react';
import { InteractiveProbabilityFormula } from './InteractiveProbabilityFormula';
import {
  getOutcomeDotAnimation,
  NAV_SECTIONS,
  resolveActiveNavSection,
  type NavSectionId,
} from '@/lib/interactive-formula';
import {
  dice,
  odd,
  prime,
  even,
  union,
  intersection,
  complement,
  motionTokens,
  easeLuxury,
} from '@/lib/math';
import MaterialList from './MaterialList';
import ScrollScene3D from './ScrollScene3D';
import FoldingSectionCard from './FoldingSectionCard';

export type DisplayMode = 'full' | 'calm' | 'focus';
export type Scenario = 'prime' | 'even';
export type Region = 'union' | 'intersection' | 'complement';

interface ExperienceProps {
  styleguide?: boolean;
  prototype?: boolean;
  folding?: boolean;
}

function SectionWrapper({
  prototype,
  enabled,
  quiet,
  children,
}: {
  prototype: boolean;
  enabled: boolean;
  quiet: boolean;
  children: React.ReactNode;
}) {
  if (!prototype) return <>{children}</>;
  return (
    <FoldingSectionCard enabled={enabled} quiet={quiet}>
      {children}
    </FoldingSectionCard>
  );
}

function OutcomeDot({
  value,
  x,
  y,
  isSelected,
  quiet,
  duration,
}: {
  value: string;
  x: number;
  y: number;
  isSelected: boolean;
  quiet: boolean;
  duration: number;
}) {
  const prevSelectedRef = useRef<boolean>(isSelected);
  const wasSelected = prevSelectedRef.current;

  useEffect(() => {
    prevSelectedRef.current = isSelected;
  }, [isSelected]);

  const anim = getOutcomeDotAnimation({
    isSelected,
    wasSelected,
    quiet,
  });

  return (
    <motion.g
      animate={{ x, y }}
      transition={{ duration, ease: easeLuxury }}
    >
      <g className="outcome-dot-group">
        <circle r="24" fill="transparent" />
        <motion.circle
          r="19"
          animate={{
            scale: anim.scale,
            fill: anim.fill,
          }}
          transition={anim.transition}
          stroke={anim.stroke}
          strokeWidth="1"
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />
        <motion.text
          textAnchor="middle"
          dy="6"
          animate={{
            scale: anim.scale,
            fill: anim.textColor,
          }}
          transition={anim.transition}
          style={{ transformOrigin: 'center', transformBox: 'fill-box', pointerEvents: 'none' }}
          fontSize="17"
        >
          {value}
        </motion.text>
      </g>
    </motion.g>
  );
}

export default function Experience({
  styleguide = false,
  prototype = false,
  folding: initialFolding,
}: ExperienceProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('full');
  const [scenario, setScenario] = useState<Scenario>('prime');
  const [region, setRegion] = useState<Region>('union');
  const [activeNav, setActiveNav] = useState<NavSectionId>('beranda');
  const foldingEnabled = initialFolding ?? prototype;
  const reduced = useReducedMotion();
  const grainId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const sections = [
      { id: 'beranda', el: document.getElementById('beranda') },
      { id: 'dadu', el: document.getElementById('dadu') },
      { id: 'lab', el: document.getElementById('lab') },
      { id: 'materi', el: document.getElementById('materi') },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
        if (visible?.target?.id) {
          setActiveNav(resolveActiveNavSection(visible.target.id));
        }
      },
      { threshold: 0, rootMargin: '-70px 0px -50% 0px' }
    );

    sections.forEach((s) => {
      if (s.el) observer.observe(s.el);
    });

    return () => observer.disconnect();
  }, []);

  const b = scenario === 'prime' ? prime : even;
  const shared = intersection(odd, b);
  const combined = union(odd, b);
  const selected =
    region === 'union'
      ? combined
      : region === 'intersection'
      ? shared
      : complement(dice.outcomes, odd);

  const quiet = (mounted && reduced) || mode !== 'full';
  const duration = quiet ? motionTokens.instant : motionTokens.diagram;
  const pillTransition = quiet
    ? { duration: 0 }
    : ({ type: 'spring', stiffness: 380, damping: 30 } as const);
  const answerSwap = {
    initial: quiet ? false : { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: quiet ? { opacity: 1 } : { opacity: 0, y: -4 },
    transition: { duration: quiet ? 0 : 0.16, ease: 'easeOut' },
  } as const;

  const points =
    scenario === 'prime'
      ? [
          { v: '1', x: 175, y: 165 },
          { v: '3', x: 280, y: 145 },
          { v: '5', x: 280, y: 193 },
          { v: '2', x: 380, y: 165 },
          { v: '4', x: 430, y: 282 },
          { v: '6', x: 475, y: 282 },
        ]
      : [
          { v: '1', x: 145, y: 140 },
          { v: '3', x: 125, y: 185 },
          { v: '5', x: 175, y: 185 },
          { v: '2', x: 395, y: 140 },
          { v: '4', x: 375, y: 185 },
          { v: '6', x: 425, y: 185 },
        ];

  return (
    <div data-mode={mode}>
      <a className="skip" href="#main">
        Lewati navigasi
      </a>

      <header>
        <Link className="brand" href={prototype ? '/prototype' : '/'}>
          <span className="brand-symbol">
            <i />
            <i />
          </span>
          ruang peluang<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Navigasi utama" className="nav-pill-group">
          {NAV_SECTIONS.map((item) => {
            const isActive = activeNav === item.id;
            const isHome = item.id === 'beranda';
            const href = isHome ? (prototype ? '/prototype' : '/') : `#${item.id}`;

            return isHome ? (
              <Link
                key={item.id}
                href={href}
                className={`nav-pill-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive && !styleguide ? 'page' : undefined}
                onClick={() => setActiveNav('beranda')}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="nav-active-pill"
                    transition={
                      quiet
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 28 }
                    }
                  />
                )}
                <span className="nav-pill-text">{item.label}</span>
              </Link>
            ) : (
              <a
                key={item.id}
                href={href}
                className={`nav-pill-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActiveNav(item.id)}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="nav-active-pill"
                    transition={
                      quiet
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 28 }
                    }
                  />
                )}
                <span className="nav-pill-text">{item.label}</span>
              </a>
            );
          })}
        </nav>
        <Link
          className="nav-go"
          href={prototype ? '/' : '/styleguide'}
          aria-label={prototype ? 'Kembali ke beranda utama' : 'Buka sistem desain'}
        >
          <ArrowUpRight size={20} />
        </Link>
      </header>

      <main id="main">
        <div className="topline">
          <label>
            <span className="topline-label-text">Mode tampilan</span>
            <select
              aria-label="Mode tampilan"
              value={mode}
              onChange={(e) => setMode(e.target.value as DisplayMode)}
            >
              <option value="full">Interaktif penuh</option>
              <option value="calm">Tenang</option>
              <option value="focus">Fokus ujian</option>
            </select>
          </label>
        </div>

        <div className={prototype ? 'folding-sections-container' : 'prototype-sections-wrap'}>
          {/* CARD 00: HERO */}
          <SectionWrapper
            prototype={prototype}
            enabled={foldingEnabled}
            quiet={!!quiet}
          >
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
          </SectionWrapper>

          {/* CARD 01: 3D DICE SCROLLYTELLING */}
          <SectionWrapper
            prototype={prototype}
            enabled={foldingEnabled}
            quiet={!!quiet}
          >
            <section id="dadu" className="scrolly-section-wrapper">
              <div className="section-title">
                <div>
                  <h2>Dadu yang Bergulir.</h2>
                </div>
                <p>
                  Sebelum angka dan rumus dihitung, peluang berakar dari peristiwa nyata. Gulir untuk
                  mengamati bagaimana pergerakan dadu 3D melahirkan ruang sampel dan titik kejadian.
                </p>
              </div>

              <ScrollScene3D quiet={!!quiet} />
            </section>
          </SectionWrapper>

          {/* CARD 02: VENN DIAGRAM LAB */}
          <SectionWrapper
            prototype={prototype}
            enabled={foldingEnabled}
            quiet={!!quiet}
          >
            <section id="lab" className="lab-section">
          <div className="section-title">
            <div>
              <h2>
                Satu dadu.
                <br />
                Banyak kemungkinan.
              </h2>
            </div>
            <p>
              Apakah kejadian ganjil dan prima bisa terjadi bersamaan? Pilih skenario, lalu sorot
              daerahnya.
            </p>
          </div>
          <div className="lab-grid">
            <div className="diagram">
              <svg
                viewBox="0 0 560 330"
                role="img"
                aria-label={`A ganjil, B ${
                  scenario === 'prime' ? 'prima' : 'genap'
                }. Titik terpilih: ${selected.join(', ') || 'tidak ada'}.`}
              >
                <motion.circle
                  initial={false}
                  animate={{
                    cx: scenario === 'prime' ? 220 : 150,
                    fill: region === 'complement' ? '#ead5ce' : '#efb3a3',
                  }}
                  transition={{ duration, ease: easeLuxury }}
                  cy="170"
                  r="105"
                />
                <motion.circle
                  initial={{ cx: scenario === 'prime' ? 340 : 400 }}
                  animate={{ cx: scenario === 'prime' ? 340 : 400 }}
                  transition={{ duration, ease: easeLuxury }}
                  cy="170"
                  r="105"
                  fill="#f6cf7b"
                  style={{ mixBlendMode: 'multiply' }}
                />
                <text x="130" y="90" fontSize="18">
                  A · ganjil
                </text>
                <text x="340" y="90" fontSize="18">
                  B · {scenario === 'prime' ? 'prima' : 'genap'}
                </text>
                {points.map((p) => (
                  <OutcomeDot
                    key={p.v}
                    value={p.v}
                    x={p.x}
                    y={p.y}
                    isSelected={selected.includes(p.v)}
                    quiet={!!quiet}
                    duration={duration}
                  />
                ))}
              </svg>
            </div>

            <div className="lab-controls">
              <div className="eyebrow">01 / PILIH SKENARIO</div>
              <div className="segmented">
                {[
                  ['prime', 'Ganjil & prima'],
                  ['even', 'Ganjil & genap'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={scenario === v}
                    className={scenario === v ? 'active' : ''}
                    onClick={() => setScenario(v as Scenario)}
                  >
                    {scenario === v && (
                      <motion.span
                        layoutId="lab-scenario-pill"
                        className="toggle-active-pill"
                        transition={pillTransition}
                        style={{ borderRadius: 999 }}
                      />
                    )}
                    <span className="toggle-pill-text">{l}</span>
                  </button>
                ))}
              </div>

              <div className="eyebrow">02 / SOROT KEJADIAN</div>
              <div className="region-buttons">
                {[
                  ['union', 'A ∪ B'],
                  ['intersection', 'A ∩ B'],
                  ['complement', 'Aᶜ'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={region === v}
                    className={region === v ? 'active' : ''}
                    onClick={() => setRegion(v as Region)}
                  >
                    {region === v && (
                      <motion.span
                        layoutId="lab-region-pill"
                        className="toggle-active-pill"
                        transition={pillTransition}
                        style={{ borderRadius: 999 }}
                      />
                    )}
                    <span className="toggle-pill-text">{l}</span>
                  </button>
                ))}
              </div>

              <div className="answer" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={region} {...answerSwap}>
                    {region === 'union'
                      ? 'GABUNGAN'
                      : region === 'intersection'
                      ? 'IRISAN'
                      : 'KOMPLEMEN A'}
                  </motion.span>
                </AnimatePresence>
                <InteractiveProbabilityFormula
                  eventNotation={
                    region === 'union'
                      ? 'A\\cup B'
                      : region === 'intersection'
                      ? 'A\\cap B'
                      : 'A^c'
                  }
                  numerator={selected.length}
                  denominator={dice.outcomes.length}
                  quiet={!!quiet}
                />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={region === 'complement' ? region : `${region}-${scenario}`}
                    {...answerSwap}
                  >
                    {region === 'union'
                      ? `Ada ${combined.length} hasil yang termasuk A atau B. Irisan berisi ${shared.length} hasil; jangan dihitung dua kali.`
                      : region === 'intersection'
                      ? `${shared.length} hasil termasuk A dan B sekaligus: ${
                          shared.length ? '{' + shared.join(', ') + '}' : '∅'
                        }.`
                      : 'Hasil yang bukan ganjil adalah {2, 4, 6}. Peluangnya 1 − 3/6 = 3/6.'}
                  </motion.p>
                </AnimatePresence>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setRegion('union');
                  setScenario('prime');
                }}
              >
                Ulangi eksplorasi ↗
              </button>
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* CARD 03: CURRICULUM MATERIAL LIST */}
      <SectionWrapper
        prototype={prototype}
        enabled={foldingEnabled}
        quiet={!!quiet}
      >
        <MaterialList quiet={!!quiet} />
      </SectionWrapper>
    </div>

        {styleguide && (
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
              {['#F3F0EE', '#FCFBFA', '#141413', '#CF4500', '#F37338', '#EB001B', '#F79E1B'].map(
                (c) => (
                  <div key={c}>
                    <i style={{ background: c }} />
                    <code>{c}</code>
                  </div>
                )
              )}
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
        )}
      </main>

      <footer className={prototype ? 'prototype-footer' : ''}>
        <Link className="brand" href={prototype ? '/prototype' : '/'}>
          ruang peluang<span className="brand-dot">.</span>
        </Link>
        <span>
          {prototype
            ? 'Prototipe Visualisasi 3D — Ruang Peluang v0.1'
            : 'Lihat. Coba. Pahami.'}
        </span>
        <Link href={prototype ? '/' : '/styleguide'}>
          {prototype ? (
            <>
              ← Kembali ke Beranda Utama <ArrowUpRight size={14} />
            </>
          ) : (
            <>
              Sistem desain <MoveUpRight size={14} />
            </>
          )}
        </Link>
      </footer>
    </div>
  );
}
