"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Transition } from 'motion/react';
import { InteractiveProbabilityFormula } from '../InteractiveProbabilityFormula';
import { getOutcomeDotAnimation } from '@/lib/interactive-formula';
import { POINTS } from '@/lib/film';
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

type Scenario = 'prime' | 'even';
type Region = 'union' | 'intersection' | 'complement';

const SCENARIO_OPTIONS: readonly { value: Scenario; label: string }[] = [
  { value: 'prime', label: 'Ganjil & prima' },
  { value: 'even', label: 'Ganjil & genap' },
];

const REGION_OPTIONS: readonly { value: Region; label: string }[] = [
  { value: 'union', label: 'A ∪ B' },
  { value: 'intersection', label: 'A ∩ B' },
  { value: 'complement', label: 'Aᶜ' },
];

const REGION_TITLE: Record<Region, string> = {
  union: 'GABUNGAN',
  intersection: 'IRISAN',
  complement: 'KOMPLEMEN A',
};

const REGION_NOTATION: Record<Region, string> = {
  union: 'A\\cup B',
  intersection: 'A\\cap B',
  complement: 'A^c',
};

function describeRegion(region: Region, combined: readonly string[], shared: readonly string[]) {
  if (region === 'union') {
    return `Ada ${combined.length} hasil yang termasuk A atau B. Irisan berisi ${shared.length} hasil; jangan dihitung dua kali.`;
  }
  if (region === 'intersection') {
    return `${shared.length} hasil termasuk A dan B sekaligus: ${
      shared.length ? '{' + shared.join(', ') + '}' : '∅'
    }.`;
  }
  return 'Hasil yang bukan ganjil adalah {2, 4, 6}. Peluangnya 1 − 3/6 = 3/6.';
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
  // Previous selection kept in state (not a ref) so the pop is derived without reading refs during render.
  const [selection, setSelection] = useState({ isSelected, wasSelected: isSelected });
  if (selection.isSelected !== isSelected) {
    setSelection({ isSelected, wasSelected: selection.isSelected });
  }

  const anim = getOutcomeDotAnimation({
    isSelected,
    wasSelected: selection.wasSelected,
    quiet,
  });

  return (
    <motion.g
      initial={false}
      animate={{ transform: `translate(${x}px, ${y}px)` }}
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

function PillToggleGroup<T extends string>({
  className,
  layoutId,
  options,
  value,
  onChange,
  transition,
}: {
  className: string;
  layoutId: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  transition: Transition;
}) {
  return (
    <div className={className}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
        >
          {value === option.value && (
            <motion.span
              layoutId={layoutId}
              className="toggle-active-pill"
              transition={transition}
              style={{ borderRadius: 999 }}
            />
          )}
          <span className="toggle-pill-text">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function VennLab({ quiet }: { quiet: boolean }) {
  const [scenario, setScenario] = useState<Scenario>('prime');
  const [region, setRegion] = useState<Region>('union');

  const b = scenario === 'prime' ? prime : even;
  const shared = intersection(odd, b);
  const combined = union(odd, b);
  const selectedByRegion: Record<Region, string[]> = {
    union: combined,
    intersection: shared,
    complement: complement(dice.outcomes, odd),
  };
  const selected = selectedByRegion[region];

  const duration = quiet ? motionTokens.instant : motionTokens.diagram;
  const pillTransition: Transition = quiet
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 30 };
  const answerSwap = {
    initial: quiet ? false : { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: quiet ? { opacity: 1 } : { opacity: 0, y: -4 },
    transition: { duration: quiet ? 0 : 0.16, ease: 'easeOut' },
  } as const;

  return (
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
                transform: `translateX(${scenario === 'prime' ? 0 : -70}px)`,
                fill: region === 'complement' ? '#ead5ce' : '#efb3a3',
              }}
              transition={{ duration, ease: easeLuxury }}
              cx="220"
              cy="170"
              r="105"
            />
            <motion.circle
              initial={false}
              animate={{ transform: `translateX(${scenario === 'prime' ? 0 : 60}px)` }}
              transition={{ duration, ease: easeLuxury }}
              cx="340"
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
            {POINTS[scenario].map((p) => (
              <OutcomeDot
                key={p.v}
                value={p.v}
                x={p.x}
                y={p.y}
                isSelected={selected.includes(p.v)}
                quiet={quiet}
                duration={duration}
              />
            ))}
          </svg>
        </div>

        <div className="lab-controls">
          <div className="eyebrow">01 / PILIH SKENARIO</div>
          <PillToggleGroup
            className="segmented"
            layoutId="lab-scenario-pill"
            options={SCENARIO_OPTIONS}
            value={scenario}
            onChange={setScenario}
            transition={pillTransition}
          />

          <div className="eyebrow">02 / SOROT KEJADIAN</div>
          <PillToggleGroup
            className="region-buttons"
            layoutId="lab-region-pill"
            options={REGION_OPTIONS}
            value={region}
            onChange={setRegion}
            transition={pillTransition}
          />

          <div className="answer" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={region} {...answerSwap}>
                {REGION_TITLE[region]}
              </motion.span>
            </AnimatePresence>
            <InteractiveProbabilityFormula
              eventNotation={REGION_NOTATION[region]}
              numerator={selected.length}
              denominator={dice.outcomes.length}
              quiet={quiet}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={region === 'complement' ? region : `${region}-${scenario}`}
                {...answerSwap}
              >
                {describeRegion(region, combined, shared)}
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

      <p className="lab-more">
        Ingin mencoba koin, spinner, atau kejadianmu sendiri?{' '}
        <Link href="/playground">Buka taman bermain</Link>
      </p>
    </section>
  );
}
