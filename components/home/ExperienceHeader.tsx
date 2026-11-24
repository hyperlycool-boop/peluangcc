"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import {
  NAV_SECTIONS,
  resolveActiveNavSection,
  type NavSectionId,
} from '@/lib/interactive-formula';
import { SITE_PAGES } from '@/lib/site-pages';

function useActiveNavSection() {
  const [activeNav, setActiveNav] = useState<NavSectionId>('beranda');
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = [
      { id: 'beranda', el: document.getElementById('beranda') },
      { id: 'dadu', el: document.getElementById('dadu') },
      { id: 'lab', el: document.getElementById('lab') },
      { id: 'materi', el: document.getElementById('materi') },
    ];

    // A callback only lists the sections that changed, so keep every section's latest state and
    // rank all of them. Ranking the batch alone kept a section active after it had left the zone.
    const latest = new Map<string, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => latest.set(entry.target.id, entry));
        const visible = Array.from(latest.values())
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.target.getBoundingClientRect().top) - Math.abs(b.target.getBoundingClientRect().top)
          )[0];
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

  // Keep the active link visible when the header nav scrolls sideways on narrow screens.
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('header nav');
    const active = nav?.querySelector<HTMLElement>('.nav-pill-item.is-active');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const navBox = nav.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    nav.scrollTo({
      left: nav.scrollLeft + box.left - navBox.left - (navBox.width - box.width) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [activeNav, reduced]);

  return [activeNav, setActiveNav] as const;
}

function NavPillContent({
  isActive,
  label,
  quiet,
}: {
  isActive: boolean;
  label: string;
  quiet: boolean;
}) {
  return (
    <>
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
      <span className="nav-pill-text">{label}</span>
    </>
  );
}

export default function ExperienceHeader({
  styleguide,
  prototype,
  quiet,
}: {
  styleguide: boolean;
  prototype: boolean;
  quiet: boolean;
}) {
  const [activeNav, setActiveNav] = useActiveNavSection();

  return (
    <header className="site-header">
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
              <NavPillContent isActive={isActive} label={item.label} quiet={quiet} />
            </Link>
          ) : (
            <a
              key={item.id}
              href={href}
              className={`nav-pill-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => setActiveNav(item.id)}
            >
              <NavPillContent isActive={isActive} label={item.label} quiet={quiet} />
            </a>
          );
        })}
        {SITE_PAGES.map((page) => (
          <Link key={page.id} href={page.href} className="nav-pill-item">
            <span className="nav-pill-text">{page.label}</span>
          </Link>
        ))}
      </nav>
      {(prototype || styleguide) && (
        <Link
          className="nav-go"
          href={prototype ? '/' : '/styleguide'}
          aria-label={prototype ? 'Kembali ke beranda utama' : 'Buka sistem desain'}
        >
          <ArrowUpRight size={20} />
        </Link>
      )}
    </header>
  );
}
