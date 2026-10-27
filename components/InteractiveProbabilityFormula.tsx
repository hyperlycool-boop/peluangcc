"use client";

import React from 'react';
import { Formula } from './Formula';
import { RollingNumber } from './RollingNumber';
import { formatProbabilityAriaLabel } from '../lib/interactive-formula';

export interface InteractiveProbabilityFormulaProps {
  eventNotation: string;
  numerator: number;
  denominator?: number;
  quiet?: boolean;
  className?: string;
}

export function InteractiveProbabilityFormula({
  eventNotation,
  numerator,
  denominator = 6,
  quiet = false,
  className = '',
}: InteractiveProbabilityFormulaProps) {
  const ariaLabel = formatProbabilityAriaLabel(eventNotation, numerator, denominator);

  return (
    <div
      className={`interactive-formula ${className}`}
      role="math"
      aria-label={ariaLabel}
    >
      <span className="formula-prefix" aria-hidden="true">
        <Formula tex={`P(${eventNotation}) = `} />
      </span>
      <span className="formula-fraction" aria-hidden="true">
        <span className="formula-fraction-num">
          <RollingNumber
            value={numerator}
            max={denominator}
            quiet={quiet}
          />
        </span>
        <span className="formula-fraction-bar" />
        <span className="formula-fraction-den tabular-nums">{denominator}</span>
      </span>
    </div>
  );
}
