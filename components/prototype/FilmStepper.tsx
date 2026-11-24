"use client";

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FILM_STAGE_COUNT, FILM_STOPS, filmScrollTop, type FilmStage } from '@/lib/film';
import { getLenis } from '@/lib/smooth-scroll';

// Under 300 ms: a keyboard-driven stage change should feel immediate.
const JUMP_SECONDS = 0.3;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName);
}

export default function FilmStepper({
  stage,
  runwayRef,
}: {
  stage: FilmStage;
  runwayRef: RefObject<HTMLDivElement | null>;
}) {
  // A jump takes a second; repeated presses count from where the last one is heading.
  const pendingRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const jump = useCallback(
    (direction: -1 | 1, immediate = false) => {
      const runway = runwayRef.current;
      if (!runway) return;

      const target = (pendingRef.current ?? stage) + direction;
      if (target < 1 || target > FILM_STAGE_COUNT) return;

      pendingRef.current = target;
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = setTimeout(() => {
        pendingRef.current = null;
      }, JUMP_SECONDS * 1000 + 200);

      const top = filmScrollTop(
        FILM_STOPS[target - 1],
        window.scrollY + runway.getBoundingClientRect().top,
        runway.offsetHeight,
        window.innerHeight
      );
      const lenis = getLenis();
      // Keyboard jumps land at once: a key pressed again and again should never wait on motion.
      if (lenis) lenis.scrollTo(top, immediate ? { immediate: true } : { duration: JUMP_SECONDS });
      else window.scrollTo({ top });
    },
    [runwayRef, stage]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isTypingTarget(event.target)) return;

      const rect = runwayRef.current?.getBoundingClientRect();
      const middle = window.innerHeight / 2;
      if (!rect || rect.top > middle || rect.bottom < middle) return;

      event.preventDefault();
      // A held key would otherwise race to the last stage.
      if (event.repeat) return;
      jump(event.key === 'ArrowLeft' ? -1 : 1, true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [jump, runwayRef]);

  useEffect(
    () => () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    },
    []
  );

  return (
    <div className="film-stepper" role="group" aria-label="Kendali tahap">
      {/* aria-disabled, not disabled: a natively disabled button drops keyboard focus. jump() ignores out-of-range targets. */}
      <button type="button" onClick={() => jump(-1)} aria-disabled={stage === 1}>
        <ArrowLeft size={20} aria-hidden="true" />
        Mundur
      </button>
      <span className="film-stepper-count" aria-live="polite">
        {stage} / {FILM_STAGE_COUNT}
      </span>
      <button type="button" onClick={() => jump(1)} aria-disabled={stage === FILM_STAGE_COUNT}>
        Lanjut
        <ArrowRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
