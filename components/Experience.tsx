"use client";

import { useState, useId } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, MoveUpRight, Sparkles, Layers, ArrowLeft } from 'lucide-react';
import { Formula } from './Formula';
import {
  dice,
  odd,
  prime,
  even,
  union,
  intersection,
  complement,
  motionTokens,
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
  sectionNumber,
  sectionTitle,
  children,
}: {
  prototype: boolean;
  enabled: boolean;
  quiet: boolean;
  sectionNumber?: string;
  sectionTitle?: string;
  children: React.ReactNode;
}) {
  if (!prototype) return <>{children}</>;
  return (
    <FoldingSectionCard
      enabled={enabled}
      quiet={quiet}
      sectionNumber={sectionNumber}
      sectionTitle={sectionTitle}
    >
      {children}
    </FoldingSectionCard>
  );
}

export default function Experience({
  styleguide = false,
  prototype = false,
  folding: initialFolding,
}: ExperienceProps) {
  const [mode, setMode] = useState<DisplayMode>('full');
  const [scenario, setScenario] = useState<Scenario>('prime');
  const [region, setRegion] = useState<Region>('union');
  const [foldingEnabled, setFoldingEnabled] = useState<boolean>(
    initialFolding ?? (prototype ? true : false)
  );
  const reduced = useReducedMotion();
  const grainId = useId();

  const b = scenario === 'prime' ? prime : even;
  const shared = intersection(odd, b);
  const combined = union(odd, b);
  const selected =
    region === 'union'
      ? combined
      : region === 'intersection'
      ? shared
      : complement(dice.outcomes, odd);

  const quiet = reduced || mode !== 'full';
  const duration = quiet ? motionTokens.instant : motionTokens.diagram;

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

      {prototype && (
        <div className="prototype-banner">
          <span>
            <Sparkles size={14} className="inline mr-1 text-[#cf4500]" />
            KLON PROTOTIPE: Klon Beranda Utama dengan 3D Folding Scroll & Dadu Bebas
          </span>
          <Link href="/" className="banner-link">
            <ArrowLeft size={14} /> Beranda Asli
          </Link>
        </div>
      )}

      <header className={prototype ? 'prototype-header' : ''}>
        <Link className="brand" href={prototype ? '/prototype' : '/'}>
          <span className="brand-symbol">
            <i />
            <i />
          </span>
          ruang peluang<span className="brand-dot">.</span>
          {prototype && <span className="prototype-tag">PROTOTIPE</span>}
        </Link>
        <nav aria-label="Navigasi utama">
          <Link href={prototype ? '/prototype' : '/'} aria-current={!styleguide ? 'page' : undefined}>
            Beranda
          </Link>
          <a href="#lab">Lab Diagram</a>
          <a href="#dadu">Dadu 3D</a>
          <a href="#materi">Materi</a>
        </nav>
        <Link
          className="nav-go"
          href={prototype ? '/' : '/styleguide'}
          aria-label={prototype ? 'Kembali ke beranda utama' : 'Buka sistem desain'}
        >
          {prototype ? <ArrowLeft size={20} /> : <ArrowUpRight size={20} />}
        </Link>
      </header>

      <main id="main">
        <div className="topline">
          <span>
            <span className="status-dot" /> MATEMATIKA, DALAM PERSPEKTIF BARU
          </span>
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

        {/* Page-level 3D Folding Mode Comparison Switcher on Prototype */}
        {prototype && (
          <div className="folding-toggle-bar">
            <div className="folding-toggle-info">
              <Layers size={18} className="text-[#cf4500]" />
              <span>
                <strong>3D Folding Scroll:</strong> Setiap bagian beranda dibagi menjadi kartu 3D yang melipat secara fisik saat di-scroll.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`folding-toggle-btn ${foldingEnabled ? 'is-active' : ''}`}
                onClick={() => setFoldingEnabled(true)}
                aria-pressed={foldingEnabled}
              >
                Lipatan 3D Aktif
              </button>
              <button
                type="button"
                className={`folding-toggle-btn ${!foldingEnabled ? 'is-active' : ''}`}
                onClick={() => setFoldingEnabled(false)}
                aria-pressed={!foldingEnabled}
              >
                Mode Datar Standar
              </button>
            </div>
          </div>
        )}

        <div className={prototype && foldingEnabled ? 'folding-sections-container' : 'prototype-sections-wrap'}>
          {/* CARD 00: HERO */}
          <SectionWrapper
            prototype={prototype}
            enabled={foldingEnabled}
            quiet={!!quiet}
            sectionNumber="00 / PENGANTAR"
            sectionTitle="RUANG UNTUK RASA INGIN TAHU"
          >
            <section className={`hero ${!styleguide ? 'homepage-hero' : ''}`}>
              <div className="hero-copy">
                <div className="eyebrow">RUANG UNTUK RASA INGIN TAHU</div>
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
                <a className="button primary" href="#lab">
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

          {/* CARD 01: VENN DIAGRAM LAB */}
          <SectionWrapper
            prototype={prototype}
            enabled={foldingEnabled}
            quiet={!!quiet}
            sectionNumber="01 / EKSPERIMEN HIMPUNAN"
            sectionTitle="LAB INTERAKTIF DIAGRAM VENN"
          >
            <section id="lab" className="lab-section">
          <div className="section-title">
            <div>
              <div className="eyebrow">SEDIKIT MENCOBA, BANYAK MEMAHAMI</div>
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
              <div className="diagram-head">
                <span>RUANG SAMPEL · DADU ADIL</span>
                <span className="mono">n(S) = {dice.outcomes.length}</span>
              </div>
              <svg
                viewBox="0 0 560 330"
                role="img"
                aria-label={`A ganjil, B ${
                  scenario === 'prime' ? 'prima' : 'genap'
                }. Titik terpilih: ${selected.join(', ') || 'tidak ada'}.`}
              >
                <text x="24" y="45" fill="#777" fontSize="20">
                  S
                </text>
                <motion.circle
                  animate={{ cx: scenario === 'prime' ? 220 : 150 }}
                  transition={{ duration }}
                  cy="170"
                  r="105"
                  fill={region === 'complement' ? '#ead5ce' : '#efb3a3'}
                />
                <motion.circle
                  animate={{ cx: scenario === 'prime' ? 340 : 400 }}
                  transition={{ duration }}
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
                  <motion.g key={p.v} animate={{ x: p.x, y: p.y }} transition={{ duration }}>
                    <circle
                      r="19"
                      fill={selected.includes(p.v) ? '#141413' : '#fff'}
                      stroke="#141413"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="6"
                      fill={selected.includes(p.v) ? '#fff' : '#141413'}
                      fontSize="17"
                    >
                      {p.v}
                    </text>
                  </motion.g>
                ))}
              </svg>
              <div className="legend">
                <span>
                  <i className="black-dot" />
                  Termasuk kejadian terpilih
                </span>
                <span>Diagram menunjukkan keanggotaan, bukan skala luas.</span>
              </div>
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
                    {l}
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
                    {l}
                  </button>
                ))}
              </div>

              <div className="answer" aria-live="polite">
                <span>
                  {region === 'union'
                    ? 'GABUNGAN'
                    : region === 'intersection'
                    ? 'IRISAN'
                    : 'KOMPLEMEN A'}
                </span>
                <Formula
                  tex={`P(${
                    region === 'union'
                      ? 'A\\cup B'
                      : region === 'intersection'
                      ? 'A\\cap B'
                      : 'A^c'
                  })=\\frac{${selected.length}}{${dice.outcomes.length}}`}
                />
                <p>
                  {region === 'union'
                    ? `Ada ${combined.length} hasil yang termasuk A atau B. Irisan berisi ${shared.length} hasil; jangan dihitung dua kali.`
                    : region === 'intersection'
                    ? `${shared.length} hasil termasuk A dan B sekaligus: ${
                        shared.length ? '{' + shared.join(', ') + '}' : '∅'
                      }.`
                    : 'Hasil yang bukan ganjil adalah {2, 4, 6}. Peluangnya 1 − 3/6 = 3/6.'}
                </p>
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

      {/* CARD 02: 3D DICE SCROLLYTELLING */}
      <SectionWrapper
        prototype={prototype}
        enabled={foldingEnabled}
        quiet={!!quiet}
        sectionNumber="02 / FISIKA KE PROBABILITAS"
        sectionTitle="DADU 3D SCROLLYTELLING"
      >
        <section id="dadu" className="scrolly-section-wrapper">
          <div className="section-title">
            <div>
              <div className="eyebrow">DARI BENDA FISIK KE PELUANG</div>
              <h2>Dadu yang Bergulir.</h2>
            </div>
            <p>
              Sebelum angka dan rumus dihitung, peluang berakar dari peristiwa nyata. Gulir untuk
              mengamati bagaimana pergerakan dadu 3D melahirkan ruang sampel dan titik kejadian.
            </p>
          </div>

          <ScrollScene3D quiet={!!quiet} folding={foldingEnabled} />
        </section>
      </SectionWrapper>

      {/* CARD 03: CURRICULUM MATERIAL LIST */}
      <SectionWrapper
        prototype={prototype}
        enabled={foldingEnabled}
        quiet={!!quiet}
        sectionNumber="03 / PETA BELAJAR"
        sectionTitle="5 MODUL MATERI KURIKULUM"
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
