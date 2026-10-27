"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { materials } from '@/lib/materials';
import MaterialDiagram from './MaterialDiagram';
import { LessonExperiment } from './LessonExperiments';

interface MaterialListProps {
  quiet: boolean;
}

export default function MaterialList({ quiet }: MaterialListProps) {
  const [active, setActive] = useState<number | null>(null);
  const [experiment, setExperiment] = useState<number | null>(null);

  return (
    <section id="materi">
      <div className="section-title">
        <div>
          <h2>Mulai dari kemungkinan.</h2>
        </div>
        <p>Pilih materi untuk belajar, atau coba animasinya langsung di sini.</p>
      </div>
      <div className="material-browser" onMouseLeave={() => setActive(null)}>
        {materials.map((m, i) => (
          <div className={`material-item ${active === i ? 'is-active' : ''}`} key={m.slug}>
            <Link
              className="module"
              href={`/materi/${m.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="module-number">0{i + 1}</span>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
              <span className="material-open">
                Pelajari <ArrowUpRight size={18} />
              </span>
            </Link>
            <div className="material-experiment-actions">
              <button
                type="button"
                aria-expanded={experiment === i}
                aria-controls={`material-experiment-${m.slug}`}
                onClick={() => setExperiment(current => current === i ? null : i)}
              >
                {experiment === i ? 'Tutup animasi' : 'Coba animasi'} <span aria-hidden="true">{experiment === i ? '−' : '+'}</span>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {experiment === i && (
                <motion.div
                  id={`material-experiment-${m.slug}`}
                  key={`experiment-${m.slug}`}
                  className="material-live-experiment"
                  data-quiet={quiet}
                  initial={quiet ? false : { opacity: 0, height: 0 }}
                  animate={quiet ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                  exit={quiet ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={
                    quiet
                      ? { duration: 0 }
                      : { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
                  }
                  style={{ overflow: 'hidden' }}
                >
                  <LessonExperiment index={i} quiet={quiet} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="material-preview" hidden={experiment === i}>
              <div>
                <MaterialDiagram index={i} quiet={quiet} />
                <p>{m.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
