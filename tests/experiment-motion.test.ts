import { describe, it, expect } from 'vitest';
import {
  INITIAL_BAG,
  createDrawState,
  drawBall,
  FREQUENCY_DOMAINS,
  frequencyDomain,
  frequencyPoints,
  splitFrequencyPath,
  frequencyDrawDuration,
  coinFlipDelayMs,
  COIN_FLIP_STAGGER_MS,
} from '../lib/experiment-motion';

const pickFirst = () => 0;
const pickLast = () => 0.999;

describe('Ball draw state (shared-element travel)', () => {
  it('starts with 3 red and 2 blue balls with unique stable ids', () => {
    const state = createDrawState();
    expect(state.draws).toEqual([]);
    expect(state.bag.map((b) => b.color)).toEqual(['merah', 'merah', 'merah', 'biru', 'biru']);
    expect(new Set(state.bag.map((b) => b.id)).size).toBe(5);
    expect(state.bag).toEqual(INITIAL_BAG);
  });

  it('does not mutate the initial bag', () => {
    const state = createDrawState();
    drawBall(state, false, pickFirst);
    expect(INITIAL_BAG).toHaveLength(5);
    expect(state.bag).toHaveLength(5);
  });

  it('without replacement moves the same ball (same id) from bag to draws', () => {
    const first = drawBall(createDrawState(), false, pickFirst);
    expect(first.draws).toHaveLength(1);
    expect(first.bag).toHaveLength(4);
    expect(first.bag.map((b) => b.id)).not.toContain(first.draws[0].id);
    expect(INITIAL_BAG.map((b) => b.id)).toContain(first.draws[0].id);
    expect(first.draws[0].sourceId).toBeUndefined();
  });

  it('without replacement changes the composition for the second draw', () => {
    const first = drawBall(createDrawState(), false, pickFirst);
    expect(first.draws[0].color).toBe('merah');
    expect(first.bag.filter((b) => b.color === 'merah')).toHaveLength(2);
    const second = drawBall(first, false, pickLast);
    expect(second.bag).toHaveLength(3);
    expect(second.draws.map((b) => b.color)).toEqual(['merah', 'biru']);
  });

  it('with replacement keeps the bag intact and records a copy pointing at the source ball', () => {
    const first = drawBall(createDrawState(), true, pickFirst);
    expect(first.bag).toEqual(INITIAL_BAG);
    expect(first.draws[0].sourceId).toBe(INITIAL_BAG[0].id);
    expect(first.draws[0].color).toBe(INITIAL_BAG[0].color);
  });

  it('with replacement gives each draw a unique id even when the same ball is drawn twice', () => {
    const twice = drawBall(drawBall(createDrawState(), true, pickFirst), true, pickFirst);
    expect(twice.draws).toHaveLength(2);
    expect(twice.draws[0].sourceId).toBe(twice.draws[1].sourceId);
    expect(twice.draws[0].id).not.toBe(twice.draws[1].id);
    const bagIds = twice.bag.map((b) => b.id);
    twice.draws.forEach((d) => expect(bagIds).not.toContain(d.id));
  });

  it('stops after two draws', () => {
    const full = drawBall(drawBall(createDrawState(), false, pickFirst), false, pickFirst);
    expect(drawBall(full, false, pickFirst)).toBe(full);
  });

  it('clamps out-of-range random values to a valid ball', () => {
    expect(drawBall(createDrawState(), false, () => 1).draws[0].id).toBe(INITIAL_BAG[4].id);
    expect(drawBall(createDrawState(), false, () => -0.5).draws[0].id).toBe(INITIAL_BAG[0].id);
  });
});

describe('Frequency chart incremental drawing', () => {
  it('uses a stepped x-domain so the line is not rescaled on every toss', () => {
    expect(FREQUENCY_DOMAINS).toEqual([10, 50, 100, 500, 1000]);
    expect(frequencyDomain(0)).toBe(10);
    expect(frequencyDomain(1)).toBe(10);
    expect(frequencyDomain(10)).toBe(10);
    expect(frequencyDomain(11)).toBe(50);
    expect(frequencyDomain(100)).toBe(100);
    expect(frequencyDomain(101)).toBe(500);
    expect(frequencyDomain(1000)).toBe(1000);
    expect(frequencyDomain(5000)).toBe(1000);
  });

  it('plots running relative frequency against a fixed domain', () => {
    const pts = frequencyPoints([true, false, true, true], 10);
    expect(pts).toHaveLength(4);
    expect(pts[0]).toEqual([40, 30]);
    expect(pts[1]).toEqual([40 + 520 / 9, 110]);
    expect(pts[3][1]).toBe(190 - 0.75 * 160);
  });

  it('reaches the right edge exactly when the domain is full', () => {
    const pts = frequencyPoints(Array.from({ length: 10 }, () => false), 10);
    expect(pts[9]).toEqual([560, 190]);
  });

  it('draws everything as fresh on the first batch', () => {
    const { settled, fresh } = splitFrequencyPath([true, false, true], 0, 10);
    expect(settled).toBe('');
    expect(fresh.split(' ')).toHaveLength(3);
  });

  it('keeps earlier points settled and connects the fresh segment to the last settled point', () => {
    const tosses = [true, false, true, false, true];
    const { settled, fresh } = splitFrequencyPath(tosses, 3, 10);
    const all = frequencyPoints(tosses, 10).map(([x, y]) => `${x},${y}`);
    expect(settled.split(' ')).toEqual(all.slice(0, 3));
    expect(fresh.split(' ')).toEqual(all.slice(2));
  });

  it('returns empty strings when a segment has fewer than two points', () => {
    expect(splitFrequencyPath([], 0, 10)).toEqual({ settled: '', fresh: '' });
    expect(splitFrequencyPath([true], 0, 10)).toEqual({ settled: '', fresh: '' });
    expect(splitFrequencyPath([true, true], 1, 10).settled).toBe('');
    expect(splitFrequencyPath([true, true], 2, 10).fresh).toBe('');
  });

  it('clamps prevCount into range', () => {
    const tosses = [true, false, true];
    expect(splitFrequencyPath(tosses, -4, 10)).toEqual(splitFrequencyPath(tosses, 0, 10));
    expect(splitFrequencyPath(tosses, 99, 10)).toEqual(splitFrequencyPath(tosses, 3, 10));
  });

  it('scales draw duration with batch size and drops to zero when quiet', () => {
    expect(frequencyDrawDuration(1, false)).toBe(0.25);
    expect(frequencyDrawDuration(10, false)).toBe(0.4);
    expect(frequencyDrawDuration(100, false)).toBe(0.65);
    expect(frequencyDrawDuration(0, false)).toBe(0);
    expect(frequencyDrawDuration(100, true)).toBe(0);
  });
});

describe('Coin flip stagger', () => {
  it('flips a single new toss immediately', () => {
    // 5 tosses before, 6 now, all visible (coinBase 0): the new coin is index 5.
    expect(coinFlipDelayMs(5, 5, 0)).toBe(0);
  });

  it('staggers a batch from its first visible new coin', () => {
    // 3 before, +10 → 13 tosses, last 12 visible start at index 1; new coins are 3..12.
    expect(coinFlipDelayMs(3, 3, 1)).toBe(0);
    expect(coinFlipDelayMs(4, 3, 1)).toBe(COIN_FLIP_STAGGER_MS);
    expect(coinFlipDelayMs(12, 3, 1)).toBe(9 * COIN_FLIP_STAGGER_MS);
  });

  it('starts at the window edge when the batch is larger than the visible window', () => {
    // 0 before, +100 → visible window starts at 88, all visible coins are new.
    expect(coinFlipDelayMs(88, 0, 88)).toBe(0);
    expect(coinFlipDelayMs(99, 0, 88)).toBe(11 * COIN_FLIP_STAGGER_MS);
  });

  it('never returns a negative delay for older coins', () => {
    expect(coinFlipDelayMs(1, 3, 1)).toBe(0);
  });
});
