"use client";

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { ArrowUpRight, MoveUpRight } from 'lucide-react';
import { useHydrated } from '@/lib/use-hydrated';
import {
  readDisplayMode,
  setDisplayMode,
  subscribeDisplayMode,
  type DisplayMode,
} from '@/lib/display-mode';
import MaterialList from './MaterialList';
import ScrollScene3D from './ScrollScene3D';
import FoldingSectionCard from './FoldingSectionCard';
import { FooterLinks } from './SiteChrome';
import ExperienceHeader from './home/ExperienceHeader';
import HeroSection from './home/HeroSection';
import StyleguideTokens from './home/StyleguideTokens';
import VennLab from './home/VennLab';

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

export default function Experience({
  styleguide = false,
  prototype = false,
  folding: initialFolding,
}: ExperienceProps) {
  const mounted = useHydrated();
  // Saved for the session and mirrored on <html data-motion> so page transitions respect it too.
  const mode = useSyncExternalStore<DisplayMode>(subscribeDisplayMode, readDisplayMode, () => 'full');
  const foldingEnabled = initialFolding ?? prototype;
  const reduced = useReducedMotion();

  const quiet = !!((mounted && reduced) || mode !== 'full');
  const cardProps = { prototype, enabled: foldingEnabled, quiet };

  return (
    <div data-mode={mode}>
      <a className="skip" href="#main">
        Lewati navigasi
      </a>

      <ExperienceHeader styleguide={styleguide} prototype={prototype} quiet={quiet} />

      <main id="main">
        <div className="topline">
          <label>
            <span className="topline-label-text">Mode tampilan</span>
            <select
              aria-label="Mode tampilan"
              value={mode}
              onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
            >
              <option value="full">Interaktif penuh</option>
              <option value="calm">Tenang</option>
              <option value="focus">Fokus ujian</option>
            </select>
          </label>
        </div>

        <div className={prototype ? 'folding-sections-container' : 'prototype-sections-wrap'}>
          {/* CARD 00: HERO */}
          <SectionWrapper {...cardProps}>
            <HeroSection styleguide={styleguide} quiet={quiet} />
          </SectionWrapper>

          {/* CARD 01: 3D DICE SCROLLYTELLING */}
          <SectionWrapper {...cardProps}>
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

              <ScrollScene3D quiet={quiet} />
            </section>
          </SectionWrapper>

          {/* CARD 02: VENN DIAGRAM LAB */}
          <SectionWrapper {...cardProps}>
            <VennLab quiet={quiet} />
          </SectionWrapper>

          {/* CARD 03: CURRICULUM MATERIAL LIST */}
          <SectionWrapper {...cardProps}>
            <MaterialList quiet={quiet} />
          </SectionWrapper>
        </div>

        {styleguide && <StyleguideTokens />}
      </main>

      <footer className={prototype ? 'prototype-footer' : ''}>
        <Link className="brand" href={prototype ? '/prototype' : '/'}>
          ruang peluang<span className="brand-dot">.</span>
        </Link>
        {!prototype && <FooterLinks />}
        <span>
          {prototype
            ? 'Prototipe Visualisasi 3D — Ruang Peluang v0.1'
            : 'Lihat. Coba. Pahami.'}
        </span>
        {(prototype || styleguide) && (
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
        )}
      </footer>
    </div>
  );
}
