"use client";

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  calculateRollingDirection,
  calculateReelOffset,
  generateSlotReelNumbers,
  getRollingSpringConfig,
  type RollingDirection,
} from '../lib/interactive-formula';

export interface RollingNumberProps {
  value: number;
  max?: number;
  quiet?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function RollingNumber({
  value,
  max = 6,
  quiet = false,
  className = '',
  ariaLabel,
}: RollingNumberProps) {
  const systemReduced = useReducedMotion();
  const isQuiet = Boolean(quiet || systemReduced);
  // Previous value kept in state (not a ref) so direction is derived without reading refs during render.
  const [rolled, setRolled] = useState<{ value: number; direction: RollingDirection }>({
    value,
    direction: 'none',
  });
  if (rolled.value !== value) {
    setRolled({ value, direction: calculateRollingDirection(value, rolled.value) });
  }
  const direction = rolled.direction;

  const numbers = generateSlotReelNumbers(max);
  const spring = getRollingSpringConfig(isQuiet);
  const offset = calculateReelOffset(value, max);

  return (
    <span
      className={`rolling-number-window tabular-nums ${className}`}
      data-direction={direction}
      data-quiet={quiet ? 'true' : 'false'}
      aria-label={ariaLabel}
    >
      <span className="sr-only">{value}</span>
      <motion.span
        className="rolling-number-reel"
        aria-hidden="true"
        animate={{ transform: `translateY(${offset})` }}
        initial={false}
        transition={
          isQuiet
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: spring.stiffness,
                damping: spring.damping,
                mass: spring.mass,
              }
        }
      >
        {numbers.map((num) => (
          <span key={num} className="rolling-number-digit tabular-nums">
            {num}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
