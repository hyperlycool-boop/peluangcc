"use client";

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import Die3D from '@/components/Die3D';
import { Formula } from '@/components/Formula';
import { STAGES, type StepItem } from '@/components/ScrollScene3D';
import {
  DIE_EXIT,
  FILM_STOPS,
  FILM_TEX,
  FILM_TEXT_WINDOWS,
  OBSERVED_OUTCOME,
  getFilmStage,
  settleTumbleAngle,
  toDieProgress,
  type FilmStage,
} from '@/lib/film';
import { DIE_KINEMATICS_BREAKPOINTS, TUMBLE_CONFIG, calculateDecelerationFactor } from '@/lib/scrolly';
import FilmStepper from './FilmStepper';
import SampleSpaceLayer from './SampleSpaceLayer';

const OBSERVED_FACE = Number(OBSERVED_OUTCOME);

const FILM_STAGES: readonly StepItem[] = [
  ...STAGES.slice(0, 3),
  {
    num: 4,
    title: 'Ruang Sampel',
    desc: 'Keenam sisi dadu kini menjadi enam titik. Himpunan semua hasil yang mungkin inilah ruang sampel S, termasuk hasil yang baru saja teramati.',
    formula: FILM_TEX.sampleSpace,
  },
  {
    num: 5,
    title: 'Kejadian A',
    desc: 'Misalkan A adalah kejadian muncul mata dadu ganjil. Titik yang termasuk A dilingkari, lalu dihitung.',
    formula: FILM_TEX.eventA,
  },
  { ...STAGES[3], num: 6, formula: FILM_TEX.probabilityA },
];

function useDieChannel(dieProgress: MotionValue<number>, output: readonly number[]) {
  return useTransform(dieProgress, [...DIE_KINEMATICS_BREAKPOINTS.progress], [...output]);
}

function FilmText({
  item,
  progress,
  isActive,
}: {
  item: StepItem;
  progress: MotionValue<number>;
  isActive: boolean;
}) {
  const textWindow = FILM_TEXT_WINDOWS[item.num as FilmStage];
  const opacity = useTransform(progress, textWindow.progress, textWindow.opacity);
  const y = useTransform(progress, textWindow.progress, textWindow.translateY);

  return (
    <motion.div
      className={`floating-stage-item stage-${item.num} ${
        item.num % 2 === 1 ? 'stage-pos-left' : 'stage-pos-right'
      } ${item.num >= 4 ? 'film-text-wide' : ''} ${isActive ? 'is-active-stage' : ''}`}
      style={{ opacity, y, pointerEvents: isActive ? 'auto' : 'none' }}
    >
      <h3 className="floating-stage-title">{item.title}</h3>
      <p className="floating-stage-desc">{item.desc}</p>
      {item.formula && (
        <div className="floating-stage-formula">
          <Formula tex={item.formula} />
        </div>
      )}
    </motion.div>
  );
}

function RunningFilm() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ['start start', 'end end'],
  });
  // Light spring: Lenis already smooths scroll, so this only takes the edge off without lagging behind it.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 1,
    restDelta: 0.0005,
  });

  const dieProgress = useTransform(smooth, toDieProgress);
  const rotateX = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.rotateX);
  const rotateY = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.rotateY);
  const rotateZ = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.rotateZ);
  const translateY = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.translateY);
  const shadowScale = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.shadowScale);
  const shadowOpacity = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.shadowOpacity);
  const dieOpacity = useTransform(smooth, DIE_EXIT.progress, DIE_EXIT.opacity);
  const dieScale = useTransform(smooth, DIE_EXIT.progress, DIE_EXIT.scale);

  const [stage, setStage] = useState<FilmStage>(1);
  // The tumble ends where its deceleration factor reaches 0, which is slightly inside stage 3.
  const [airborne, setAirborne] = useState(true);
  useEffect(
    () =>
      smooth.on('change', (value) => {
        setStage(getFilmStage(value));
        setAirborne(toDieProgress(value) < TUMBLE_CONFIG.DECEL_END);
      }),
    [smooth]
  );

  const tumbleX = useMotionValue(0);
  const tumbleY = useMotionValue(0);
  const tumbleZ = useMotionValue(0);
  const angleXRef = useRef(0);
  const angleYRef = useRef(0);
  const isInView = useInView(runwayRef, { margin: '100px 0px 100px 0px' });

  // Airborne tumble: runs only while the runway is on screen and the die has not landed.
  useEffect(() => {
    if (!isInView || !airborne) {
      tumbleX.set(0);
      tumbleY.set(0);
      tumbleZ.set(0);
      return;
    }

    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      // Cap the step so returning to the tab does not jump the die.
      const step = Math.min(now - lastTime, 35) / 1000;
      lastTime = now;
      const factor = calculateDecelerationFactor(dieProgress.get());

      // Time spins the die only in free tumble. While it slows down, scroll alone unwinds the angle.
      if (factor >= 1) {
        angleXRef.current += TUMBLE_CONFIG.SPEED_X * step;
        angleYRef.current += TUMBLE_CONFIG.SPEED_Y * step;
      }
      tumbleX.set(settleTumbleAngle(angleXRef.current, factor));
      tumbleY.set(settleTumbleAngle(angleYRef.current, factor));
      tumbleZ.set(Math.sin((now / 1000) * 2) * 20 * factor);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, airborne, dieProgress, tumbleX, tumbleY, tumbleZ]);

  return (
    <div ref={runwayRef} className="scrolly-canvas-runway">
      <div className="scrolly-stage-pinned">
        <div className="film-diagram-stage">
          <SampleSpaceLayer progress={smooth} />
        </div>

        <motion.div className="scrolly-die-center-stage" style={{ opacity: dieOpacity }}>
          <motion.div style={{ scale: dieScale }}>
            <Die3D
              size={170}
              rotateX={rotateX}
              rotateY={rotateY}
              rotateZ={rotateZ}
              translateY={translateY}
              tumbleX={tumbleX}
              tumbleY={tumbleY}
              tumbleZ={tumbleZ}
              shadowScale={shadowScale}
              shadowOpacity={shadowOpacity}
              highlightFace={stage === 3 || stage === 4 ? OBSERVED_FACE : null}
            />
          </motion.div>
        </motion.div>

        <div className="scrolly-floating-narrative">
          {FILM_STAGES.map((item) => (
            <FilmText key={item.num} item={item} progress={smooth} isActive={stage === item.num} />
          ))}
        </div>

        <FilmStepper stage={stage} runwayRef={runwayRef} />
      </div>
    </div>
  );
}

/** Tenang, Fokus ujian and reduced motion: the same content, read top to bottom. */
function QuietFilm() {
  const settled = useMotionValue<number>(FILM_STOPS[FILM_STOPS.length - 1]);

  return (
    <div className="film-quiet">
      <div className="film-quiet-die">
        <Die3D size={170} rotateX={18} rotateY={35} highlightFace={OBSERVED_FACE} />
      </div>
      <ol className="film-quiet-steps">
        {FILM_STAGES.map((item) => (
          <li key={item.num}>
            <h3 className="floating-stage-title">{item.title}</h3>
            <p className="floating-stage-desc">{item.desc}</p>
            {item.formula && (
              <div className="floating-stage-formula">
                <Formula tex={item.formula} />
              </div>
            )}
          </li>
        ))}
      </ol>
      <div className="film-quiet-diagram">
        <SampleSpaceLayer progress={settled} />
      </div>
    </div>
  );
}

export default function FilmScene({ quiet }: { quiet: boolean }) {
  return <div className="film-scene">{quiet ? <QuietFilm /> : <RunningFilm />}</div>;
}
