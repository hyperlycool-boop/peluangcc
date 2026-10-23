"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import Die3D from './Die3D';
import { Formula } from '@/components/Formula';

interface ScrollScene3DProps {
  onStageChange?: (stage: number) => void;
  quiet?: boolean;
  folding?: boolean;
}

interface StepItem {
  num: number;
  badge: string;
  title: string;
  desc: string;
  formula: string | null;
  dieAction: string;
}

const STAGES: readonly StepItem[] = [
  {
    num: 1,
    badge: 'TAHAP 01 / RUANG SAMPEL',
    title: 'Dadu Seimbang',
    desc: 'Sebuah kubus dengan enam sisi datar yang seimbang. Sebelum dilempar, setiap kemungkinan berada dalam kondisi setara tanpa ada yang diistimewakan.',
    formula: null,
    dieAction: 'Dadu berada dalam posisi isometrik stabil dan seimbang.',
  },
  {
    num: 2,
    badge: 'TAHAP 02 / DI UDARA',
    title: 'Rotasi Bebas & Keacakan',
    desc: 'Saat melayang di udara, dadu berputar bebas dalam ruang tiga dimensi. Bentuk simetris kubus menjamin terjadinya keacakan murni tanpa bias.',
    formula: null,
    dieAction: 'Dadu melayang dan berputar perlahan secara adil di udara.',
  },
  {
    num: 3,
    badge: 'TAHAP 03 / PENDARATAN',
    title: 'Hasil yang Teramati',
    desc: 'Dadu mendarat dan berhenti di atas meja. Sisi yang menghadap ke atas menjadi satu kejadian nyata yang teramati dari seluruh kemungkinan yang ada.',
    formula: null,
    dieAction: 'Dadu mendarat mantap, memperlihatkan satu sisi hasil pengamatan.',
  },
  {
    num: 4,
    badge: 'TAHAP 04 / DEFINISI DASAR',
    title: 'Konsep Peluang',
    desc: 'Peluang mengukur seberapa besar kemungkinan suatu kejadian yang kita amati terhadap seluruh kemungkinan yang ada pada ruang sampel.',
    formula: 'P(A) = \\frac{n(A)}{n(S)}',
    dieAction: 'Definisi dasar peluang: perbandingan kejadian terhadap ruang sampel.',
  },
];

interface FoldingStepCardProps {
  st: StepItem;
  isActive: boolean;
  isReduced: boolean;
  folding: boolean;
}

function FoldingStepCard({ st, isActive, isReduced, folding }: FoldingStepCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // 3D Origami kinematics: Entry fold (-20°) -> Flat reading zone (0°) -> Exit fold (+18°)
  const rawRotX = useTransform(
    scrollYProgress,
    [0, 0.28, 0.45, 0.72, 1],
    [-20, -10, 0, 0, 18]
  );

  // Depth pullback in Z for realistic paper perspective
  const rawTranslateZ = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [-25, 0, 0, -25]
  );

  // Crease lighting overlay: darkest when angled away, transparent when flat
  const rawCreaseOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.45, 0.72, 0.95, 1],
    [0.26, 0.16, 0, 0, 0.16, 0.24]
  );

  // Subtle natural scale
  const rawScale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0.98, 1, 1, 0.98]
  );

  const rotX = isReduced || !folding ? 0 : rawRotX;
  const translateZ = isReduced || !folding ? 0 : rawTranslateZ;
  const creaseOpacity = isReduced || !folding ? 0 : rawCreaseOpacity;
  const scale = isReduced || !folding ? 1 : rawScale;

  return (
    <motion.div
      ref={cardRef}
      className={`scrolly-step-card ${folding ? 'folding-step-card' : ''} ${isActive ? 'is-active-step' : ''}`}
      style={{
        rotateX: rotX,
        translateZ: translateZ,
        scale: scale,
        transformOrigin: '50% 50%',
      }}
    >
      {/* 3D Dynamic Crease Lighting Layer */}
      {folding && (
        <motion.div
          className="folding-crease-overlay"
          style={{ opacity: creaseOpacity }}
          aria-hidden="true"
        />
      )}

      <div className="step-card-header">
        <span className="step-badge">{st.badge}</span>
        <span className="step-num font-mono">0{st.num}</span>
      </div>

      <h3>{st.title}</h3>
      <p>{st.desc}</p>

      {st.formula && (
        <div className="step-formula">
          <Formula tex={st.formula} />
        </div>
      )}

      {st.num === 4 && (
        <p className="step-lesson-hint">
          Perhitungan angka detail, irisan himpunan, dan pembuktian lengkap dibahas pada setiap modul materi di bawah.
        </p>
      )}

      <div className="step-action-sync">
        <span className="sync-dot" />
        <small>{st.dieAction}</small>
      </div>
    </motion.div>
  );
}

export default function ScrollScene3D({ onStageChange, quiet = false, folding = false }: ScrollScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const systemReduced = useReducedMotion();
  const isReduced = Boolean(quiet || systemReduced);

  // Scroll tracking inside the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calm, controlled spring physics: low stiffness caps velocity so animation never spins wildly
  const smooth = useSpring(scrollYProgress, {
    stiffness: 28, // Calibrated low stiffness limits max rotational velocity
    damping: 24,   // High damping ratio absorbs rapid scroll spikes cleanly
    mass: 1.2,     // Natural inertia prevents abrupt jumps
    restDelta: 0.0005,
  });

  // Limited, gentle rotation speed across stages:
  // Stage 1 (0.00 - 0.22): Rest isometrik seimbang (X: 18°, Y: 35°)
  // Stage 2 (0.26 - 0.54): Di udara, berguling perlahan terukur
  // Stage 3 (0.56 - 0.78): Mendarat tenang memperlihatkan sisi atas (X: 0°, Y: 270°)
  // Stage 4 (0.80 - 1.00): Sudut pengamatan tenang (X: 22°, Y: 295°)
  const rotX = useTransform(
    smooth,
    [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1],
    [18, 18, 65, 30, 0, 0, 22, 22]
  );

  const rotY = useTransform(
    smooth,
    [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1],
    [35, 35, 140, 230, 270, 270, 295, 295]
  );

  const rotZ = useTransform(
    smooth,
    [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1],
    [0, 0, 12, 5, 0, 0, 0, 0]
  );

  // Controlled, gentle elevation (lifts max 60px rather than flying away)
  const elevY = useTransform(
    smooth,
    [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1],
    [0, 0, -60, -45, 0, 0, -15, -15]
  );

  // Floor shadow dynamics matching elevation
  const shadowScale = useTransform(
    smooth,
    [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1],
    [1, 1, 0.65, 0.75, 1.08, 1.08, 0.95, 0.95]
  );

  const shadowOpacity = useTransform(
    smooth,
    [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1],
    [0.42, 0.42, 0.2, 0.24, 0.48, 0.48, 0.38, 0.38]
  );

  // Active stage state driven by the smoothed spring value
  const [stage, setStage] = useState(1);
  const [scrollPct, setScrollPct] = useState(0);
  const lastStageRef = useRef(1);

  useEffect(() => {
    return smooth.on('change', (v) => {
      setScrollPct(Math.round(v * 100));
      let current = 1;
      if (v < 0.24) current = 1;
      else if (v < 0.56) current = 2;
      else if (v < 0.80) current = 3;
      else current = 4;

      if (current !== lastStageRef.current) {
        lastStageRef.current = current;
        setStage(current);
        onStageChange?.(current);
      }
    });
  }, [smooth, onStageChange]);

  return (
    <div ref={containerRef} className="scrolly-split-container">
      {/* LEFT COLUMN: Narrative Steps (with optional 3D Folding Scroll) */}
      <div className={`scrolly-text-column ${folding ? 'folding-perspective-container' : ''}`}>
        {STAGES.map((st) => (
          <FoldingStepCard
            key={st.num}
            st={st}
            isActive={stage === st.num}
            isReduced={isReduced}
            folding={folding}
          />
        ))}
      </div>

      {/* RIGHT COLUMN: Free-Floating 3D Die (TAKEN OUT OF THE BOX) */}
      <div className="scrolly-sticky-column">
        <div className="scrolly-die-freeform">
          {/* Subtle floating telemetry pill (no heavy box) */}
          <div className="freeform-status-pill">
            <span className="status-kicker">DADU 3D</span>
            <span className="status-divider">·</span>
            <span className="status-label">
              {stage === 1
                ? 'Dadu Seimbang'
                : stage === 2
                ? 'Melayang Bebas'
                : stage === 3
                ? 'Hasil Teramati'
                : 'Definisi Peluang'}
            </span>
            <span className="status-pct font-mono">{scrollPct}%</span>
          </div>

          {/* 3D Visual Stage: Floating directly on page canvas */}
          <div className="freeform-stage-viewport">
            <Die3D
              size={135}
              rotateX={isReduced ? 18 : rotX}
              rotateY={isReduced ? 35 : rotY}
              rotateZ={isReduced ? 0 : rotZ}
              translateY={isReduced ? 0 : elevY}
              shadowScale={isReduced ? 1 : shadowScale}
              shadowOpacity={isReduced ? 0.35 : shadowOpacity}
              highlightFace={stage === 3 ? 3 : null}
            />

            {/* Stage 3 Live Observation Callout (No Numbers/Complex Formulas) */}
            {stage === 3 && (
              <motion.div
                className="freeform-proof-callout"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="proof-tag">
                  <Sparkles size={13} className="text-[#cf4500]" />
                  <span>Satu Kejadian Nyata Teramati</span>
                </div>
              </motion.div>
            )}

            {/* Stage 4 Basic Formula Callout (Directs to Individual Pages for Details) */}
            {stage === 4 && (
              <motion.div
                className="freeform-venn-callout"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <div className="side-venn-row">
                  <div className="venn-pill venn-pill-shared">
                    P(A) = n(A) / n(S)
                  </div>
                </div>
                <small className="venn-outside-note">
                  Perhitungan angka & rumus detail tersedia di setiap halaman materi
                </small>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
