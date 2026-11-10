"use client";

import { motion, useTransform, type MotionValue } from 'motion/react';
import { dice, type Outcome } from '@/lib/math';
import {
  CIRCLE_A_ENTRY,
  CIRCLE_B_ENTRY,
  FILM_DIAGRAM_LABEL,
  getDotColorTrack,
  getDotTrack,
} from '@/lib/film';
import { OUTCOME_DOT_THEME } from '@/lib/interactive-formula';

function FilmDot({ value, progress }: { value: Outcome; progress: MotionValue<number> }) {
  const track = getDotTrack(value);
  const colors = getDotColorTrack(value);
  const x = useTransform(progress, track.progress, track.x);
  const y = useTransform(progress, track.progress, track.y);
  const opacity = useTransform(progress, track.fadeProgress, track.opacity);
  const fill = useTransform(progress, colors.progress, colors.fill);
  const textColor = useTransform(progress, colors.progress, colors.textColor);

  return (
    <motion.g style={{ x, y, opacity }}>
      <motion.circle r="19" style={{ fill }} stroke={OUTCOME_DOT_THEME.stroke} strokeWidth="1" />
      <motion.text textAnchor="middle" dy="6" fontSize="17" style={{ fill: textColor }}>
        {value}
      </motion.text>
    </motion.g>
  );
}

export default function SampleSpaceLayer({ progress }: { progress: MotionValue<number> }) {
  const circleAOpacity = useTransform(progress, CIRCLE_A_ENTRY.progress, CIRCLE_A_ENTRY.opacity);
  const circleAScale = useTransform(progress, CIRCLE_A_ENTRY.progress, CIRCLE_A_ENTRY.scale);
  const circleBOpacity = useTransform(progress, CIRCLE_B_ENTRY.progress, CIRCLE_B_ENTRY.opacity);

  return (
    <svg className="film-diagram" viewBox="0 0 560 330" role="img" aria-label={FILM_DIAGRAM_LABEL}>
      <motion.circle
        cx="220"
        cy="170"
        r="105"
        fill="#efb3a3"
        style={{
          opacity: circleAOpacity,
          scale: circleAScale,
          transformOrigin: 'center',
          transformBox: 'fill-box',
        }}
      />
      <motion.circle
        cx="340"
        cy="170"
        r="105"
        fill="#f6cf7b"
        style={{ opacity: circleBOpacity, mixBlendMode: 'multiply' }}
      />
      <motion.text x="130" y="90" fontSize="18" style={{ opacity: circleAOpacity }}>
        A · ganjil
      </motion.text>
      <motion.text x="340" y="90" fontSize="18" style={{ opacity: circleBOpacity }}>
        B · prima
      </motion.text>
      {dice.outcomes.map((outcome) => (
        <FilmDot key={outcome} value={outcome} progress={progress} />
      ))}
    </svg>
  );
}
