import { describe, it, expect } from 'vitest';
import {
  calculateFoldValues,
  FOLD_BREAKPOINTS,
  getScrollyStage,
  calculateCenteredDieKinematics,
  calculateFloatingTextState,
  calculateDecelerationFactor,
  calculateContinuousTumble,
  TUMBLE_CONFIG,
} from '../lib/folding';


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

describe('Centered 3D Die Scrollytelling Kinematics', () => {
  // Stage threshold progression tests
  describe('Stage Threshold Progression', () => {
    it('maps progress < 0.24 to Stage 1 (Ruang Sampel)', () => {
      expect(getScrollyStage(0)).toBe(1);
      expect(getScrollyStage(0.1)).toBe(1);
      expect(getScrollyStage(0.239)).toBe(1);
    });

    it('maps progress 0.24 <= p < 0.56 to Stage 2 (Di Udara)', () => {
      expect(getScrollyStage(0.24)).toBe(2);
      expect(getScrollyStage(0.35)).toBe(2);
      expect(getScrollyStage(0.559)).toBe(2);
    });

    it('maps progress 0.56 <= p < 0.80 to Stage 3 (Pendaratan)', () => {
      expect(getScrollyStage(0.56)).toBe(3);
      expect(getScrollyStage(0.68)).toBe(3);
      expect(getScrollyStage(0.799)).toBe(3);
    });

    it('maps progress >= 0.80 to Stage 4 (Definisi Dasar Peluang)', () => {
      expect(getScrollyStage(0.80)).toBe(4);
      expect(getScrollyStage(0.92)).toBe(4);
      expect(getScrollyStage(1.0)).toBe(4);
    });

    it('safely handles boundary edge cases and invalid progress values', () => {
      expect(getScrollyStage(-0.5)).toBe(1);
      expect(getScrollyStage(1.5)).toBe(4);
      expect(getScrollyStage(NaN)).toBe(1);
    });
  });

  // Centered 3D Die Kinematics
  describe('Centered 3D Die Kinematics', () => {
    it('locks die orientation and elevation to calm static values in quiet mode', () => {
      for (const p of [0, 0.2, 0.38, 0.65, 0.85, 1]) {
        const k = calculateCenteredDieKinematics(p, true);
        expect(k.rotateX).toBe(18);
        expect(k.rotateY).toBe(35);
        expect(k.rotateZ).toBe(0);
        expect(k.translateY).toBe(0);
        expect(k.shadowScale).toBe(1);
        expect(k.shadowOpacity).toBe(0.35);
        expect(k.highlightFace).toBeNull();
      }
    });

    it('holds resting isometric posture during Stage 1 (p = 0.0 - 0.22)', () => {
      const atStart = calculateCenteredDieKinematics(0, false);
      expect(atStart.rotateX).toBe(18);
      expect(atStart.rotateY).toBe(35);
      expect(atStart.rotateZ).toBe(0);
      expect(atStart.translateY).toBe(0);
      expect(atStart.shadowScale).toBe(1);
      expect(atStart.shadowOpacity).toBeCloseTo(0.42, 2);
      expect(atStart.highlightFace).toBeNull();

      const atRestEnd = calculateCenteredDieKinematics(0.22, false);
      expect(atRestEnd.rotateX).toBe(18);
      expect(atRestEnd.rotateY).toBe(35);
      expect(atRestEnd.translateY).toBe(0);
    });

    it('elevates and tumbles gracefully in mid-air during Stage 2 (p = 0.38)', () => {
      const midAir = calculateCenteredDieKinematics(0.38, false);
      expect(midAir.rotateX).toBe(65);
      expect(midAir.rotateY).toBe(140);
      expect(midAir.rotateZ).toBe(12);
      expect(midAir.translateY).toBe(-60); // Maximum elevation lift (capped at -60px)
      expect(midAir.shadowScale).toBeCloseTo(0.65, 2); // Shadow contracts as die lifts
      expect(midAir.shadowOpacity).toBeCloseTo(0.20, 2); // Shadow diffuses as die lifts
      expect(midAir.highlightFace).toBeNull();
    });

    it('lands firmly on floor showing top face in Stage 3 (p = 0.60 - 0.78)', () => {
      const landed = calculateCenteredDieKinematics(0.65, false);
      expect(landed.rotateX).toBe(0);
      expect(landed.rotateY).toBe(270);
      expect(landed.rotateZ).toBe(0);
      expect(landed.translateY).toBe(0); // Floor contact grounded at 0
      expect(landed.shadowScale).toBeCloseTo(1.08, 2); // Ground contact shadow expansion
      expect(landed.shadowOpacity).toBeCloseTo(0.48, 2); // Ground contact shadow intensity
      expect(landed.highlightFace).toBe(3); // Face 3 is highlighted on landing
    });

    it('settles into clear observation angle in Stage 4 (p = 0.86 - 1.0)', () => {
      const observe = calculateCenteredDieKinematics(0.90, false);
      expect(observe.rotateX).toBe(22);
      expect(observe.rotateY).toBe(295);
      expect(observe.rotateZ).toBe(0);
      expect(observe.translateY).toBe(-15);
      expect(observe.shadowScale).toBeCloseTo(0.95, 2);
      expect(observe.shadowOpacity).toBeCloseTo(0.38, 2);
      expect(observe.highlightFace).toBeNull();
    });

    it('safely clamps out-of-bounds and NaN progress values', () => {
      const belowZero = calculateCenteredDieKinematics(-1, false);
      expect(belowZero.rotateX).toBe(18);
      expect(belowZero.rotateY).toBe(35);

      const aboveOne = calculateCenteredDieKinematics(2, false);
      expect(aboveOne.rotateX).toBe(22);
      expect(aboveOne.rotateY).toBe(295);

      const nanVal = calculateCenteredDieKinematics(NaN, false);
      expect(nanVal.rotateX).toBe(18);
      expect(nanVal.rotateY).toBe(35);
    });
  });

  // Floating Typography Transitions
  describe('Floating Typography Transitions', () => {
    it('activates exact stage text with full opacity and zero transform in quiet mode', () => {
      // At progress 0.10 (Stage 1)
      expect(calculateFloatingTextState(1, 0.10, true)).toEqual({ opacity: 1, translateY: 0, visible: true });
      expect(calculateFloatingTextState(2, 0.10, true)).toEqual({ opacity: 0, translateY: 0, visible: false });

      // At progress 0.40 (Stage 2)
      expect(calculateFloatingTextState(1, 0.40, true)).toEqual({ opacity: 0, translateY: 0, visible: false });
      expect(calculateFloatingTextState(2, 0.40, true)).toEqual({ opacity: 1, translateY: 0, visible: true });

      // At progress 0.65 (Stage 3)
      expect(calculateFloatingTextState(3, 0.65, true)).toEqual({ opacity: 1, translateY: 0, visible: true });
      expect(calculateFloatingTextState(4, 0.65, true)).toEqual({ opacity: 0, translateY: 0, visible: false });

      // At progress 0.90 (Stage 4)
      expect(calculateFloatingTextState(3, 0.90, true)).toEqual({ opacity: 0, translateY: 0, visible: false });
      expect(calculateFloatingTextState(4, 0.90, true)).toEqual({ opacity: 1, translateY: 0, visible: true });
    });

    it('fades out Stage 1 text smoothly as scroll approaches Stage 2', () => {
      const peak = calculateFloatingTextState(1, 0.08, false);
      expect(peak.opacity).toBe(1);
      expect(peak.translateY).toBe(0);
      expect(peak.visible).toBe(true);

      const fading = calculateFloatingTextState(1, 0.20, false);
      expect(fading.opacity).toBeGreaterThan(0);
      expect(fading.opacity).toBeLessThan(1);
      expect(fading.translateY).toBeLessThan(0); // Floats upward as it exits

      const gone = calculateFloatingTextState(1, 0.28, false);
      expect(gone.opacity).toBe(0);
      expect(gone.visible).toBe(false);
    });

    it('fades in Stage 2 text smoothly and reaches full opacity during peak reading zone', () => {
      const before = calculateFloatingTextState(2, 0.15, false);
      expect(before.opacity).toBe(0);
      expect(before.visible).toBe(false);

      const entering = calculateFloatingTextState(2, 0.24, false);
      expect(entering.opacity).toBeGreaterThan(0);
      expect(entering.opacity).toBeLessThan(1);
      expect(entering.translateY).toBeGreaterThan(0); // Arrives from slightly below

      const peak = calculateFloatingTextState(2, 0.38, false);
      expect(peak.opacity).toBe(1);
      expect(peak.translateY).toBe(0);
      expect(peak.visible).toBe(true);
    });

    it('ensures only the active stage has peak opacity at any given scroll point', () => {
      for (const p of [0.05, 0.38, 0.68, 0.92]) {
        const opacities = [1, 2, 3, 4].map((st) => calculateFloatingTextState(st, p, false).opacity);
        const peakStages = opacities.filter((o) => o >= 0.85);
        expect(peakStages.length).toBeLessThanOrEqual(1);
      }
    });
  });

  // Continuous Rolling & Stage 3 Deceleration
  describe('Continuous Rolling & Stage 3 Deceleration', () => {
    it('returns full rolling factor (1.0) while floating in Stages 1 & 2 (progress <= 0.50)', () => {
      expect(calculateDecelerationFactor(0)).toBe(1.0);
      expect(calculateDecelerationFactor(0.15)).toBe(1.0);
      expect(calculateDecelerationFactor(0.35)).toBe(1.0);
      expect(calculateDecelerationFactor(0.50)).toBe(1.0);
    });

    it('strictly decelerates to 0.0 between progress 0.50 and 0.60', () => {
      const f50 = calculateDecelerationFactor(0.50);
      const f53 = calculateDecelerationFactor(0.53);
      const f55 = calculateDecelerationFactor(0.55);
      const f57 = calculateDecelerationFactor(0.57);
      const f60 = calculateDecelerationFactor(0.60);

      expect(f50).toBe(1.0);
      expect(f53).toBeLessThan(f50);
      expect(f55).toBeLessThan(f53);
      expect(f55).toBeCloseTo(0.5, 1);
      expect(f57).toBeLessThan(f55);
      expect(f60).toBe(0.0);
    });

    it('locks rolling factor to exactly 0.0 at Stage 3 landing and beyond (progress >= 0.60)', () => {
      expect(calculateDecelerationFactor(0.60)).toBe(0.0);
      expect(calculateDecelerationFactor(0.70)).toBe(0.0);
      expect(calculateDecelerationFactor(0.85)).toBe(0.0);
      expect(calculateDecelerationFactor(1.00)).toBe(0.0);
    });

    it('safely handles NaN and out-of-bounds progress values in deceleration factor', () => {
      expect(calculateDecelerationFactor(NaN)).toBe(1.0);
      expect(calculateDecelerationFactor(-0.5)).toBe(1.0);
      expect(calculateDecelerationFactor(2.5)).toBe(0.0);
    });

    it('returns zero tumble angles when quiet mode is enabled', () => {
      const tumbleQuiet = calculateContinuousTumble(2.5, 0.35, true);
      expect(tumbleQuiet).toEqual({ tumbleX: 0, tumbleY: 0, tumbleZ: 0 });
    });

    it('calculates continuous multi-axis tumble during airborne stages (progress <= 0.50)', () => {
      const t1 = calculateContinuousTumble(1.0, 0.30, false);
      const t2 = calculateContinuousTumble(2.0, 0.30, false);

      // Tumbles change smoothly over time
      expect(t1.tumbleX).not.toBe(t2.tumbleX);
      expect(t1.tumbleY).not.toBe(t2.tumbleY);
      expect(t1.tumbleZ).not.toBe(t2.tumbleZ);
    });

    it('settles all tumble angles to 0 at Stage 3 landing (progress >= 0.60)', () => {
      const landed1 = calculateContinuousTumble(1.5, 0.60, false);
      const landed2 = calculateContinuousTumble(3.0, 0.75, false);

      expect(landed1).toEqual({ tumbleX: 0, tumbleY: 0, tumbleZ: 0 });
      expect(landed2).toEqual({ tumbleX: 0, tumbleY: 0, tumbleZ: 0 });
    });

    it('exports TUMBLE_CONFIG with designated angular velocities and transition boundaries', () => {
      expect(TUMBLE_CONFIG.DECEL_START).toBe(0.50);
      expect(TUMBLE_CONFIG.DECEL_END).toBe(0.60);
      expect(TUMBLE_CONFIG.SPEED_X).toBeGreaterThan(0);
      expect(TUMBLE_CONFIG.SPEED_Y).toBeGreaterThan(0);
    });
  });
});

