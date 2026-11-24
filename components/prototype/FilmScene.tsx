"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'motion/react';
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
  scrollTumble,
  toDieProgress,
  type FilmStage,
} from '@/lib/film';
import { DIE_KINEMATICS_BREAKPOINTS, calculateDecelerationFactor } from '@/lib/scrolly';
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
  // No spring on top: Lenis already smooths the scroll, and a spring would keep the die moving
  // after the page stops. Every motion below is a pure function of this scroll position.
  const { scrollYProgress: runwayProgress } = useScroll({
    target: runwayRef,
    offset: ['start start', 'end end'],
  });
  // 0 while the runway is still below the fold, 1 once it pins: the die rises in as the hero leaves.
  const { scrollYProgress: runwayArrival } = useScroll({
    target: runwayRef,
    offset: ['start end', 'start start'],
  });
  // Pass-through transforms on purpose: they opt out of Motion's native scroll-timeline acceleration,
  // which mapped the stage text windows to the wrong scroll positions (stage 1 text came back after
  // it had faded). Every value below is then computed from the real scroll progress on each frame.
  const progress = useTransform(runwayProgress, (value) => value);
  const arrival = useTransform(runwayArrival, (value) => value);

  const dieProgress = useTransform(progress, toDieProgress);
  const rotateX = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.rotateX);
  const rotateY = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.rotateY);
  const rotateZ = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.rotateZ);
  const translateY = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.translateY);
  const shadowScale = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.shadowScale);
  const shadowOpacity = useDieChannel(dieProgress, DIE_KINEMATICS_BREAKPOINTS.shadowOpacity);
  const exitOpacity = useTransform(progress, DIE_EXIT.progress, DIE_EXIT.opacity);
  const exitScale = useTransform(progress, DIE_EXIT.progress, DIE_EXIT.scale);
  const dieOpacity = useTransform([arrival, exitOpacity], ([a, o]: number[]) => Math.min(1, a / 0.7) * o);
  const dieScale = useTransform([arrival, exitScale], ([a, s]: number[]) => (0.92 + 0.08 * a) * s);
  const dieRise = useTransform(arrival, [0, 1], [60, 0]);

  // Tumble from scroll position alone (lib/film.ts scrollTumble): still whenever the page is still.
  const tumble = (axis: 'x' | 'y' | 'z') => (p: number) =>
    scrollTumble(p, calculateDecelerationFactor(p))[axis];
  const tumbleX = useTransform(dieProgress, tumble('x'));
  const tumbleY = useTransform(dieProgress, tumble('y'));
  const tumbleZ = useTransform(dieProgress, tumble('z'));

  const [stage, setStage] = useState<FilmStage>(1);
  useEffect(() => progress.on('change', (value) => setStage(getFilmStage(value))), [progress]);

  return (
    <div ref={runwayRef} className="scrolly-canvas-runway">
      <div className="scrolly-stage-pinned">
        <div className="film-diagram-stage">
          <SampleSpaceLayer progress={progress} />
        </div>

        <motion.div className="scrolly-die-center-stage" style={{ opacity: dieOpacity }}>
          <motion.div style={{ scale: dieScale, y: dieRise }}>
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
            <FilmText key={item.num} item={item} progress={progress} isActive={stage === item.num} />
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
