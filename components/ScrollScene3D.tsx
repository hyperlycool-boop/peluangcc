"use client";

import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useInView,
  useMotionValue,
} from 'motion/react';
import type { MotionValue } from 'motion/react';
import Die3D from './Die3D';
import { useHydrated } from '@/lib/use-hydrated';
import { Formula } from '@/components/Formula';
import {
  DIE_KINEMATICS_BREAKPOINTS,
  FLOATING_STAGE_BREAKPOINTS,
  getScrollyStage,
  calculateDecelerationFactor,
  TUMBLE_CONFIG,
} from '@/lib/scrolly';

interface ScrollScene3DProps {
  onStageChange?: (stage: number) => void;
  quiet?: boolean;
}

interface StepItem {
  num: number;
  title: string;
  desc: string;
  formula: string | null;
}

const STAGES: readonly StepItem[] = [
  {
    num: 1,
    title: 'Dadu Seimbang',
    desc: 'Sebuah kubus dengan enam sisi datar yang seimbang. Sebelum dilempar, setiap kemungkinan berada dalam kondisi setara tanpa ada yang diistimewakan.',
    formula: null,
  },
  {
    num: 2,
    title: 'Rotasi Bebas & Keacakan',
    desc: 'Saat melayang di udara, dadu berputar bebas dalam ruang tiga dimensi. Bentuk simetris kubus menjamin terjadinya keacakan murni tanpa bias.',
    formula: null,
  },
  {
    num: 3,
    title: 'Hasil yang Teramati',
    desc: 'Dadu mendarat dan berhenti di atas meja. Sisi yang menghadap ke atas menjadi satu kejadian nyata yang teramati dari seluruh kemungkinan yang ada.',
    formula: null,
  },
  {
    num: 4,
    title: 'Konsep Peluang',
    desc: 'Peluang mengukur seberapa besar kemungkinan suatu kejadian yang kita amati terhadap seluruh kemungkinan yang ada pada ruang sampel.',
    formula: 'P(A) = \\frac{n(A)}{n(S)}',
  },
];

interface FloatingStageItemProps {
  st: StepItem;
  smooth: MotionValue<number>;
  isReduced: boolean;
  isActive: boolean;
}

function FloatingStageItem({ st, smooth, isReduced, isActive }: FloatingStageItemProps) {
  // Pure typography transition mappings consuming single source of truth FLOATING_STAGE_BREAKPOINTS
  const bp = FLOATING_STAGE_BREAKPOINTS[st.num as 1 | 2 | 3 | 4];
  const rawOpacity = useTransform(
    smooth,
    bp.progress as unknown as number[],
    bp.opacity as unknown as number[]
  );
  const rawY = useTransform(
    smooth,
    bp.progress as unknown as number[],
    bp.translateY as unknown as number[]
  );

  const opacity = isReduced ? (isActive ? 1 : 0) : rawOpacity;
  const y = isReduced ? 0 : rawY;

  return (
    <motion.div
      className={`floating-stage-item stage-${st.num} ${st.num % 2 === 1 ? 'stage-pos-left' : 'stage-pos-right'} ${
        isActive ? 'is-active-stage' : ''
      }`}
      style={{
        opacity,
        y,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      aria-hidden={!isActive}
    >
      <h3 className="floating-stage-title">{st.title}</h3>
      <p className="floating-stage-desc">{st.desc}</p>

      {st.formula && (
        <div className="floating-stage-formula">
          <Formula tex={st.formula} />
        </div>
      )}
    </motion.div>
  );
}

export default function ScrollScene3D({
  onStageChange,
  quiet = false,
}: ScrollScene3DProps) {
  const mounted = useHydrated();
  const containerRef = useRef<HTMLDivElement>(null);
  const systemReduced = useReducedMotion();
  const isReduced = Boolean(quiet || (mounted && systemReduced));

  // Scroll tracking inside the 380vh runway container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Light spring: Lenis already smooths scroll, so this only takes the edge off without lagging behind it.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 1,
    restDelta: 0.0005,
  });

  // Multi-axis rotations & elevations mapped from calibrated breakpoints
  const rotX = useTransform(
    smooth,
    DIE_KINEMATICS_BREAKPOINTS.progress as unknown as number[],
    DIE_KINEMATICS_BREAKPOINTS.rotateX as unknown as number[]
  );

  const rotY = useTransform(
    smooth,
    DIE_KINEMATICS_BREAKPOINTS.progress as unknown as number[],
    DIE_KINEMATICS_BREAKPOINTS.rotateY as unknown as number[]
  );

  const rotZ = useTransform(
    smooth,
    DIE_KINEMATICS_BREAKPOINTS.progress as unknown as number[],
    DIE_KINEMATICS_BREAKPOINTS.rotateZ as unknown as number[]
  );

  const elevY = useTransform(
    smooth,
    DIE_KINEMATICS_BREAKPOINTS.progress as unknown as number[],
    DIE_KINEMATICS_BREAKPOINTS.translateY as unknown as number[]
  );

  const shadowScale = useTransform(
    smooth,
    DIE_KINEMATICS_BREAKPOINTS.progress as unknown as number[],
    DIE_KINEMATICS_BREAKPOINTS.shadowScale as unknown as number[]
  );

  const shadowOpacity = useTransform(
    smooth,
    DIE_KINEMATICS_BREAKPOINTS.progress as unknown as number[],
    DIE_KINEMATICS_BREAKPOINTS.shadowOpacity as unknown as number[]
  );

  // Active stage state
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const lastStageRef = useRef<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const tossTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Viewport detection: Only animate continuous roll when runway is in view
  const isInView = useInView(containerRef, { margin: '100px 0px 100px 0px' });

  // Motion values for continuous 3D tumbling in airborne stages (Stages 1 & 2)
  const tumbleX = useMotionValue(0);
  const tumbleY = useMotionValue(0);
  const tumbleZ = useMotionValue(0);

  const angleXRef = useRef(0);
  const angleYRef = useRef(0);

  // Continuous tumbling animation loop: automatically stops when off-screen or landed (Stage > 2)
  useEffect(() => {
    if (!isInView || isReduced || stage > 2) {
      if (tumbleX.get() !== 0) tumbleX.set(0);
      if (tumbleY.get() !== 0) tumbleY.set(0);
      if (tumbleZ.get() !== 0) tumbleZ.set(0);
      return;
    }

    let lastTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      const p = smooth.get();
      const factor = calculateDecelerationFactor(p);

      if (factor <= 0.0001) {
        if (tumbleX.get() !== 0) tumbleX.set(0);
        if (tumbleY.get() !== 0) tumbleY.set(0);
        if (tumbleZ.get() !== 0) tumbleZ.set(0);
        return;
      }

      // Cap delta at 35ms to prevent jump on tab focus switch
      const dt = Math.min(delta, 35) / 1000;
      const timeSec = now / 1000;

      angleXRef.current += TUMBLE_CONFIG.SPEED_X * dt * factor;
      angleYRef.current += TUMBLE_CONFIG.SPEED_Y * dt * factor;

      // Smooth decay without angular flips or discontinuities
      const curX = ((angleXRef.current % 360 + 360) % 360) * factor;
      const curY = ((angleYRef.current % 360 + 360) % 360) * factor;
      const curZ = Math.sin(timeSec * 2) * 20 * factor;

      tumbleX.set(curX);
      tumbleY.set(curY);
      tumbleZ.set(curZ);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, isReduced, stage, smooth, tumbleX, tumbleY, tumbleZ]);

  useEffect(() => {
    return () => {
      if (tossTimerRef.current) {
        clearTimeout(tossTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return smooth.on('change', (v) => {
      const current = getScrollyStage(v);
      if (current !== lastStageRef.current) {
        lastStageRef.current = current;
        setStage(current);
        onStageChange?.(current);
      }
    });
  }, [smooth, onStageChange]);

  const handleDieClick = () => {
    if (isRolling || isReduced) return;
    setIsRolling(true);
    if (tossTimerRef.current) {
      clearTimeout(tossTimerRef.current);
    }
    tossTimerRef.current = setTimeout(() => setIsRolling(false), 1200);
  };

  return (
    <div ref={containerRef} className="scrolly-canvas-runway">
      {/* Pinned 100vh Sticky Stage: Locks into center of viewport */}
      <div className="scrolly-stage-pinned">
        {/* CENTER STAGE: The 3D Die is the main attention, locked in dead center */}
        <div className="scrolly-die-center-stage">
          <Die3D
            size={170}
            rotateX={isReduced ? 18 : rotX}
            rotateY={isReduced ? 35 : rotY}
            rotateZ={isReduced ? 0 : rotZ}
            translateY={isReduced ? 0 : elevY}
            tumbleX={isReduced ? 0 : tumbleX}
            tumbleY={isReduced ? 0 : tumbleY}
            tumbleZ={isReduced ? 0 : tumbleZ}
            shadowScale={isReduced ? 1 : shadowScale}
            shadowOpacity={isReduced ? 0.35 : shadowOpacity}
            highlightFace={stage === 3 ? 3 : null}
            onClick={handleDieClick}
            isRolling={isRolling}
          />
        </div>

        {/* FLOATING TYPOGRAPHY: Pure text appearing in empty space around the die (NO BOXES) */}
        <div className="scrolly-floating-narrative">
          {STAGES.map((st) => (
            <FloatingStageItem
              key={st.num}
              st={st}
              smooth={smooth}
              isReduced={isReduced}
              isActive={stage === st.num}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
