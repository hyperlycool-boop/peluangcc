import { describe, it, expect } from 'vitest';
import { calculateFoldValues, FOLD_BREAKPOINTS } from '../lib/folding';

describe('3D Folding Kinematics Engine', () => {
  it('locks all transforms to 0 in quiet or reduced-motion mode', () => {
    for (const p of [0, 0.2, 0.35, 0.5, 0.7, 0.85, 1]) {
      const values = calculateFoldValues(p, true);
      expect(values.rotateX).toBe(0);
      expect(values.translateZ).toBe(0);
      expect(values.scale).toBe(1);
      expect(values.creaseOpacity).toBe(0);
    }
  });

  it('provides a strictly flat reading sweet spot between 35% and 65% scroll progress', () => {
    for (const p of [0.35, 0.40, 0.50, 0.60, 0.65]) {
      const values = calculateFoldValues(p, false);
      expect(values.rotateX).toBe(0);
      expect(values.translateZ).toBe(0);
      expect(values.scale).toBe(1);
      expect(values.creaseOpacity).toBe(0);
    }
  });

  it('folds backward on bottom entry (p = 0.0)', () => {
    const entry = calculateFoldValues(0, false);
    expect(entry.rotateX).toBe(-16);
    expect(entry.translateZ).toBe(-30);
    expect(entry.scale).toBe(0.97);
    expect(entry.creaseOpacity).toBeCloseTo(0.22, 2);
  });

  it('folds forward on top exit (p = 1.0)', () => {
    const exit = calculateFoldValues(1, false);
    expect(exit.rotateX).toBe(14);
    expect(exit.translateZ).toBe(-25);
    expect(exit.scale).toBe(0.98);
    expect(exit.creaseOpacity).toBeCloseTo(0.18, 2);
  });

  it('interpolates smoothly during entry transition (p = 0.25)', () => {
    const midEntry = calculateFoldValues(0.25, false);
    expect(midEntry.rotateX).toBe(-4);
    expect(midEntry.translateZ).toBe(-8);
    expect(midEntry.scale).toBe(0.99);
    expect(midEntry.creaseOpacity).toBeCloseTo(0.06, 2);
  });

  it('interpolates smoothly during exit transition (p = 0.75)', () => {
    const midExit = calculateFoldValues(0.75, false);
    expect(midExit.rotateX).toBe(6);
    expect(midExit.translateZ).toBe(-8);
    expect(midExit.scale).toBe(0.99);
    expect(midExit.creaseOpacity).toBeCloseTo(0.06, 2);
  });

  it('safely clamps out-of-bounds and NaN progress values', () => {
    const belowZero = calculateFoldValues(-0.5, false);
    expect(belowZero.rotateX).toBe(-16);
    expect(belowZero.scale).toBe(0.97);

    const aboveOne = calculateFoldValues(1.5, false);
    expect(aboveOne.rotateX).toBe(14);
    expect(aboveOne.scale).toBe(0.98);

    const nanVal = calculateFoldValues(NaN, false);
    expect(nanVal.rotateX).toBe(-16);
    expect(nanVal.scale).toBe(0.97);
  });

  it('exports standard breakpoints array for motion/react useTransform', () => {
    expect(FOLD_BREAKPOINTS.progress).toEqual([0, 0.25, 0.35, 0.65, 0.75, 1]);
    expect(FOLD_BREAKPOINTS.rotateX).toEqual([-16, -4, 0, 0, 6, 14]);
    expect(FOLD_BREAKPOINTS.translateZ).toEqual([-30, -8, 0, 0, -8, -25]);
    expect(FOLD_BREAKPOINTS.scale).toEqual([0.97, 0.99, 1, 1, 0.99, 0.98]);
    expect(FOLD_BREAKPOINTS.creaseOpacity).toEqual([0.22, 0.06, 0, 0, 0.06, 0.18]);
  });
});
