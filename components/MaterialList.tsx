"use client";

import { useState } from 'react';
import Link from 'next/link';
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
          <div className="eyebrow">PETA PERJALANAN BELAJAR</div>
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
            <div id={`material-experiment-${m.slug}`} hidden={experiment !== i} className="material-live-experiment" data-quiet={quiet}>
              {experiment === i && <LessonExperiment index={i} />}
            </div>
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
