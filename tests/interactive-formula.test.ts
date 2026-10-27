import { describe, it, expect } from 'vitest';
import {
  calculateRollingDirection,
  calculateReelOffset,
  getRollingSpringConfig,
  getOutcomeDotAnimation,
  formatProbabilityAriaLabel,
  generateSlotReelNumbers,
  ROLLING_SPRING_DEFAULTS,
  OUTCOME_DOT_THEME,
} from '../lib/interactive-formula';
import {
  dice,
  odd,
  prime,
  even,
  union,
  intersection,
  complement,
} from '../lib/math';

describe('Interactive Formula - Rolling Slot Counter Kinematics', () => {
  describe('Direction Resolution', () => {
    it('detects upward roll when value increases', () => {
      expect(calculateRollingDirection(1, 0)).toBe('up');
      expect(calculateRollingDirection(4, 2)).toBe('up');
      expect(calculateRollingDirection(6, 3)).toBe('up');
      expect(calculateRollingDirection(6, 0)).toBe('up');
    });

    it('detects downward roll when value decreases', () => {
      expect(calculateRollingDirection(0, 1)).toBe('down');
      expect(calculateRollingDirection(2, 4)).toBe('down');
      expect(calculateRollingDirection(3, 6)).toBe('down');
      expect(calculateRollingDirection(0, 6)).toBe('down');
    });

    it('detects stationary ("none") when value does not change', () => {
      expect(calculateRollingDirection(0, 0)).toBe('none');
      expect(calculateRollingDirection(3, 3)).toBe('none');
      expect(calculateRollingDirection(6, 6)).toBe('none');
    });

    it('defaults to "none" on initial mount when previous value is undefined', () => {
      expect(calculateRollingDirection(0, undefined)).toBe('none');
      expect(calculateRollingDirection(4, undefined)).toBe('none');
    });
  });

  describe('Reel Offset Calculation', () => {
    it('translates reel by -value / totalDigits * 100% for optical slot alignment', () => {
      expect(calculateReelOffset(0, 6)).toBe('0%');
      expect(calculateReelOffset(1, 6)).toBe('-14.2857%');
      expect(calculateReelOffset(3, 6)).toBe('-42.8571%');
      expect(calculateReelOffset(6, 6)).toBe('-85.7143%');
    });

    it('clamps negative values and values exceeding max capacity', () => {
      expect(calculateReelOffset(-2, 6)).toBe('0%');
      expect(calculateReelOffset(8, 6)).toBe('-85.7143%');
      expect(calculateReelOffset(NaN, 6)).toBe('0%');
    });

    it('generates a contiguous slot reel array from 0 to denominator', () => {
      expect(generateSlotReelNumbers(6)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(generateSlotReelNumbers(3)).toEqual([0, 1, 2, 3]);
    });
  });

  describe('Spring Physics & Quiet / Reduced-Motion Bypass', () => {
    it('provides standard spring physics in interactive full mode', () => {
      const config = getRollingSpringConfig(false);
      expect(config.stiffness).toBe(ROLLING_SPRING_DEFAULTS.stiffness);
      expect(config.damping).toBe(ROLLING_SPRING_DEFAULTS.damping);
      expect(config.mass).toBe(ROLLING_SPRING_DEFAULTS.mass);
      expect(config.duration).toBeUndefined();
    });

    it('bypasses spring physics with duration 0 in quiet or reduced-motion mode', () => {
      const quietConfig = getRollingSpringConfig(true);
      expect(quietConfig.duration).toBe(0);
      expect(quietConfig.stiffness).toBe(0);
      expect(quietConfig.damping).toBe(0);
    });
  });
});

describe('Outcome Dots Spring Pop & Color Morph', () => {
  describe('Color and Styling Theme Tokens', () => {
    it('defines ink dark for selected dots and paper white for unselected dots', () => {
      expect(OUTCOME_DOT_THEME.selected.fill).toBe('#141413');
      expect(OUTCOME_DOT_THEME.selected.textColor).toBe('#ffffff');
      expect(OUTCOME_DOT_THEME.unselected.fill).toBe('#ffffff');
      expect(OUTCOME_DOT_THEME.unselected.textColor).toBe('#141413');
      expect(OUTCOME_DOT_THEME.stroke).toBe('#141413');
    });
  });

  describe('Animation & Keyframes', () => {
    it('triggers spring pop [1, 1.22, 1] when becoming selected', () => {
      const anim = getOutcomeDotAnimation({
        isSelected: true,
        wasSelected: false,
        quiet: false,
      });

      expect(anim.scale).toEqual([1, 1.22, 1]);
      expect(anim.fill).toBe(OUTCOME_DOT_THEME.selected.fill);
      expect(anim.textColor).toBe(OUTCOME_DOT_THEME.selected.textColor);
      expect(anim.transition.duration).toBe(0.35);
    });

    it('triggers spring pop [1, 1.22, 1] when becoming unselected', () => {
      const anim = getOutcomeDotAnimation({
        isSelected: false,
        wasSelected: true,
        quiet: false,
      });

      expect(anim.scale).toEqual([1, 1.22, 1]);
      expect(anim.fill).toBe(OUTCOME_DOT_THEME.unselected.fill);
      expect(anim.textColor).toBe(OUTCOME_DOT_THEME.unselected.textColor);
      expect(anim.transition.duration).toBe(0.35);
    });

    it('does not pop when selection state is unchanged', () => {
      const animUnchanged = getOutcomeDotAnimation({
        isSelected: true,
        wasSelected: true,
        quiet: false,
      });

      expect(animUnchanged.scale).toBe(1);
    });

    it('locks scale to 1 and duration to 0 in quiet mode even on state change', () => {
      const animQuiet = getOutcomeDotAnimation({
        isSelected: true,
        wasSelected: false,
        quiet: true,
      });

      expect(animQuiet.scale).toBe(1);
      expect(animQuiet.transition.duration).toBe(0);
      expect(animQuiet.fill).toBe(OUTCOME_DOT_THEME.selected.fill);
      expect(animQuiet.textColor).toBe(OUTCOME_DOT_THEME.selected.textColor);
    });
  });
});

describe('Accessibility & Indonesian Math Speech Formatter', () => {
  it('formats Indonesian math speech for Union A ∪ B', () => {
    const label = formatProbabilityAriaLabel('A\\cup B', 4, 6);
    expect(label).toBe('P(A gabungan B) = 4 per 6');
  });

  it('formats Indonesian math speech for Intersection A ∩ B', () => {
    const label = formatProbabilityAriaLabel('A\\cap B', 2, 6);
    expect(label).toBe('P(A irisan B) = 2 per 6');
  });

  it('formats Indonesian math speech for Complement A^c', () => {
    const label = formatProbabilityAriaLabel('A^c', 3, 6);
    expect(label).toBe('P(komplemen A) = 3 per 6');
  });

  it('handles edge case of 0 numerator (empty set)', () => {
    const label = formatProbabilityAriaLabel('A\\cap B', 0, 6);
    expect(label).toBe('P(A irisan B) = 0 per 6');
  });

  it('handles generic event labels cleanly', () => {
    const label = formatProbabilityAriaLabel('E', 5, 6);
    expect(label).toBe('P(E) = 5 per 6');
  });
});

describe('Venn Diagram Selection State Transitions (Math Integration)', () => {
  const allOutcomes = dice.outcomes; // ['1', '2', '3', '4', '5', '6']

  it('maps Prime scenario selections to exact numerator counts and dot states', () => {
    // Prime scenario: A = odd {1, 3, 5}, B = prime {2, 3, 5}
    const b = prime;
    const u = union(odd, b); // ['1', '3', '5', '2'] -> length 4
    const i = intersection(odd, b); // ['3', '5'] -> length 2
    const c = complement(allOutcomes, odd); // ['2', '4', '6'] -> length 3

    expect(u.length).toBe(4);
    expect(i.length).toBe(2);
    expect(c.length).toBe(3);

    // Verify dot selection mapping
    for (const v of allOutcomes) {
      const inUnion = u.includes(v);
      if (['1', '2', '3', '5'].includes(v)) {
        expect(inUnion).toBe(true);
      } else {
        expect(inUnion).toBe(false);
      }
    }
  });

  it('maps Even scenario selections with empty intersection correctly', () => {
    // Even scenario: A = odd {1, 3, 5}, B = even {2, 4, 6}
    const b = even;
    const u = union(odd, b); // all 6
    const i = intersection(odd, b); // empty [] -> length 0
    const c = complement(allOutcomes, odd); // ['2', '4', '6'] -> length 3

    expect(u.length).toBe(6);
    expect(i.length).toBe(0);
    expect(c.length).toBe(3);

    // No dot selected in disjoint intersection
    for (const v of allOutcomes) {
      expect(i.includes(v)).toBe(false);
    }
  });
});

describe('Component Contracts (SSR & DOM Markup Verification)', () => {
  it('renders RollingNumber with tabular-nums and accessibility attributes', async () => {
    const React = await import('react');
    const ReactDOMServer = await import('react-dom/server');
    const { RollingNumber } = await import('../components/RollingNumber');

    const html = ReactDOMServer.renderToString(
      React.createElement(RollingNumber, {
        value: 4,
        max: 6,
        quiet: false,
      })
    );

    expect(html).toContain('rolling-number-window');
    expect(html).toContain('tabular-nums');
    expect(html).toContain('data-quiet="false"');
    expect(html).toContain('sr-only');
    expect(html).toContain('4');
    expect(html).toContain('rolling-number-reel');
  });

  it('renders RollingNumber in quiet mode with data-quiet="true"', async () => {
    const React = await import('react');
    const ReactDOMServer = await import('react-dom/server');
    const { RollingNumber } = await import('../components/RollingNumber');

    const html = ReactDOMServer.renderToString(
      React.createElement(RollingNumber, {
        value: 2,
        max: 6,
        quiet: true,
      })
    );

    expect(html).toContain('data-quiet="true"');
    expect(html).toContain('2');
  });

  it('renders InteractiveProbabilityFormula with formula prefix, fraction bar, and aria-label', async () => {
    const React = await import('react');
    const ReactDOMServer = await import('react-dom/server');
    const { InteractiveProbabilityFormula } = await import(
      '../components/InteractiveProbabilityFormula'
    );

    const html = ReactDOMServer.renderToString(
      React.createElement(InteractiveProbabilityFormula, {
        eventNotation: 'A\\cup B',
        numerator: 5,
        denominator: 6,
        quiet: false,
      })
    );

    expect(html).toContain('interactive-formula');
    expect(html).toContain('role="math"');
    expect(html).toContain('aria-label="P(A gabungan B) = 5 per 6"');
    expect(html).toContain('formula-fraction');
    expect(html).toContain('formula-fraction-bar');
    expect(html).toContain('formula-fraction-den');
    expect(html).toContain('6');
  });

  describe('Pip Glow Ripple & Navigation Pill Utilities', () => {
    it('calculates staggered delay for pips based on index', async () => {
      const { calculatePipRippleDelay } = await import('../lib/interactive-formula');
      expect(calculatePipRippleDelay(0)).toBe('0ms');
      expect(calculatePipRippleDelay(1)).toBe('80ms');
      expect(calculatePipRippleDelay(2)).toBe('160ms');
      expect(calculatePipRippleDelay(-1)).toBe('0ms');
      expect(calculatePipRippleDelay(NaN)).toBe('0ms');
    });

    it('resolves active navigation section with beranda fallback', async () => {
      const { resolveActiveNavSection } = await import('../lib/interactive-formula');
      expect(resolveActiveNavSection('dadu')).toBe('dadu');
      expect(resolveActiveNavSection('lab')).toBe('lab');
      expect(resolveActiveNavSection('materi')).toBe('materi');
      expect(resolveActiveNavSection('unknown')).toBe('beranda');
      expect(resolveActiveNavSection(null)).toBe('beranda');
      expect(resolveActiveNavSection(undefined)).toBe('beranda');
    });
  });
});

