import { describe, expect, it } from 'vitest';
import {
  FILM_COUNTS,
  FILM_STAGE_ENDS,
  FILM_STOPS,
  FILM_TEX,
  FILM_TEXT_WINDOWS,
  OBSERVED_OUTCOME,
  POINTS,
  filmScrollTop,
  getDotColorTrack,
  getDotTrack,
  SCROLL_TUMBLE,
  getFilmStage,
  scrollTumble,
  settleTumbleAngle,
  toDieProgress,
  type FilmStage,
} from '../lib/film';
import { OUTCOME_DOT_THEME } from '../lib/interactive-formula';
import { dice, odd } from '../lib/math';
import {
  SCROLLY_STAGE_THRESHOLDS,
  TUMBLE_CONFIG,
  calculateDecelerationFactor,
  getScrollyStage,
} from '../lib/scrolly';

describe('film stages', () => {
  it('switches stage exactly at each boundary', () => {
    expect(getFilmStage(0)).toBe(1);
    FILM_STAGE_ENDS.slice(0, -1).forEach((end, index) => {
      expect(getFilmStage(end - 0.001)).toBe(index + 1);
      expect(getFilmStage(end)).toBe(index + 2);
    });
    expect(getFilmStage(1)).toBe(6);
  });

  it('treats invalid progress as the start and clamps overflow', () => {
    expect(getFilmStage(Number.NaN)).toBe(1);
    expect(getFilmStage(-1)).toBe(1);
    expect(getFilmStage(2)).toBe(6);
  });

  it('places one strictly increasing stop inside each stage', () => {
    FILM_STOPS.forEach((stop, index) => {
      expect(getFilmStage(stop)).toBe(index + 1);
      if (index > 0) expect(stop).toBeGreaterThan(FILM_STOPS[index - 1]);
    });
  });

  it('shows the text fully at every stop', () => {
    FILM_STOPS.forEach((stop, index) => {
      const { progress, opacity } = FILM_TEXT_WINDOWS[(index + 1) as FilmStage];
      const fullFrom = progress[opacity.indexOf(1)];
      const fullTo = progress[opacity.lastIndexOf(1)];
      expect(stop).toBeGreaterThanOrEqual(fullFrom);
      expect(stop).toBeLessThanOrEqual(fullTo);
    });
  });
});

describe('die mapping', () => {
  it('keeps the first three die stages aligned with the film', () => {
    expect(getScrollyStage(toDieProgress(FILM_STOPS[0]))).toBe(1);
    expect(getScrollyStage(toDieProgress(FILM_STOPS[1]))).toBe(2);
    expect(getScrollyStage(toDieProgress(FILM_STOPS[2]))).toBe(3);
  });

  it('lands the die before the film leaves stage 3', () => {
    expect(toDieProgress(FILM_STAGE_ENDS[2])).toBeGreaterThanOrEqual(
      SCROLLY_STAGE_THRESHOLDS.STAGE_3_MAX - 0.001
    );
  });

  it('settles the tumble without a jump at the wrap point', () => {
    expect(settleTumbleAngle(90, 1)).toBe(90);
    expect(settleTumbleAngle(270, 1)).toBe(-90);
    expect(settleTumbleAngle(725, 0.5)).toBeCloseTo(2.5);
    expect(settleTumbleAngle(200, 0)).toBeCloseTo(0);
    // Free tumble: the wrap is a full turn, which shows the same orientation.
    expect(Math.abs(settleTumbleAngle(180.5, 1) - settleTumbleAngle(179.5, 1))).toBeCloseTo(359);
  });

  it('keeps the die still before the toss and after landing', () => {
    expect(scrollTumble(0, 1)).toEqual({ x: 0, y: 0, z: 0 });
    expect(scrollTumble(SCROLL_TUMBLE.START, 1)).toEqual({ x: 0, y: 0, z: 0 });
    const landed = scrollTumble(TUMBLE_CONFIG.DECEL_END, calculateDecelerationFactor(TUMBLE_CONFIG.DECEL_END));
    expect(Math.abs(landed.x)).toBeCloseTo(0);
    expect(Math.abs(landed.y)).toBeCloseTo(0);
    expect(Math.abs(landed.z)).toBeCloseTo(0);
  });

  it('gives the same angles for the same scroll position', () => {
    const p = (SCROLL_TUMBLE.START + SCROLL_TUMBLE.SPIN_END) / 2;
    expect(scrollTumble(p, 1)).toEqual(scrollTumble(p, 1));
  });

  it('slows down without a jump between free tumble and landing', () => {
    // From the end of the spin on, the angle only unwinds toward rest.
    let previous = scrollTumble(SCROLL_TUMBLE.SPIN_END, 1);
    for (let p = SCROLL_TUMBLE.SPIN_END + 0.001; p <= TUMBLE_CONFIG.DECEL_END + 0.001; p += 0.001) {
      const next = scrollTumble(p, calculateDecelerationFactor(p));
      expect(Math.abs(next.x - previous.x)).toBeLessThan(15);
      expect(Math.abs(next.y - previous.y)).toBeLessThan(15);
      previous = next;
    }
  });

  it('clamps to the die domain', () => {
    expect(toDieProgress(1)).toBe(1);
    expect(toDieProgress(-1)).toBe(0);
    expect(toDieProgress(Number.NaN)).toBe(0);
  });
});

describe('sample space dots', () => {
  it('moves every outcome from one origin onto its lab coordinate', () => {
    const origins = new Set<string>();
    for (const point of POINTS.prime) {
      const track = getDotTrack(point.v);
      origins.add(`${track.x[0]},${track.y[0]}`);
      expect(track.x[1]).toBe(point.x);
      expect(track.y[1]).toBe(point.y);
    }
    expect(origins.size).toBe(1);
  });

  it('has one point per outcome', () => {
    expect(POINTS.prime.map((point) => point.v).sort()).toEqual([...dice.outcomes].sort());
  });

  it('settles every dot before the stage 4 stop', () => {
    for (const outcome of dice.outcomes) {
      expect(getDotTrack(outcome).progress[1]).toBeLessThanOrEqual(FILM_STOPS[3]);
    }
  });

  it('releases the observed outcome first', () => {
    const first = getDotTrack(OBSERVED_OUTCOME).progress[0];
    for (const outcome of dice.outcomes) {
      expect(getDotTrack(outcome).progress[0]).toBeGreaterThanOrEqual(first);
    }
  });

  it('rejects outcomes outside the sample space', () => {
    expect(() => getDotTrack('7')).toThrow();
  });

  it('ends members of A on the selected theme and the rest on the unselected theme', () => {
    const { selected, unselected } = OUTCOME_DOT_THEME;
    for (const outcome of dice.outcomes) {
      const end = (odd as readonly string[]).includes(outcome) ? selected : unselected;
      const track = getDotColorTrack(outcome);
      expect(track.fill[1]).toBe(end.fill);
      expect(track.textColor[1]).toBe(end.textColor);
    }
  });
});

describe('displayed figures', () => {
  it('derive from the tested model', () => {
    expect(FILM_COUNTS.sampleSpace).toBe(dice.outcomes.length);
    expect(FILM_COUNTS.eventA).toBe(odd.length);
    expect(FILM_COUNTS.probabilityA).toBe(odd.length / dice.outcomes.length);
  });

  it('appear in the rendered TeX', () => {
    expect(FILM_TEX.sampleSpace).toContain(dice.outcomes.join(', '));
    expect(FILM_TEX.sampleSpace).toContain(`n(S) = ${dice.outcomes.length}`);
    expect(FILM_TEX.eventA).toContain(odd.join(', '));
    expect(FILM_TEX.eventA).toContain(`n(A) = ${odd.length}`);
    expect(FILM_TEX.probabilityA).toContain(`\\frac{${odd.length}}{${dice.outcomes.length}}`);
    expect(FILM_TEX.probabilityA).toContain('0{,}5');
  });
});

describe('filmScrollTop', () => {
  it('maps progress over the pinned distance', () => {
    expect(filmScrollTop(0, 1000, 6000, 1000)).toBe(1000);
    expect(filmScrollTop(0.5, 1000, 6000, 1000)).toBe(3500);
    expect(filmScrollTop(1, 1000, 6000, 1000)).toBe(6000);
  });

  it('never scrolls backwards when the runway is shorter than the viewport', () => {
    expect(filmScrollTop(1, 200, 500, 900)).toBe(200);
  });
});
