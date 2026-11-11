import { describe, expect, it } from 'vitest';
import {
  addRolls,
  emptyTally,
  eventCount,
  frequencyHistory,
  observedFrequency,
  rollDie,
  theoreticalProbability,
  totalRolls,
} from '../lib/frequency';
import { dice } from '../lib/math';

describe('rollDie', () => {
  it('maps the random range onto the six faces, including both ends', () => {
    expect(rollDie(() => 0)).toBe('1');
    expect(rollDie(() => 0.5)).toBe('4');
    expect(rollDie(() => 0.999999)).toBe('6');
    expect(rollDie(() => 1)).toBe('6');
  });

  it('can reach every face', () => {
    const seen = new Set(dice.outcomes.map((_, index) => rollDie(() => (index + 0.5) / dice.outcomes.length)));
    expect(seen.size).toBe(dice.outcomes.length);
  });
});

describe('tally', () => {
  it('counts rolls without mutating the previous tally', () => {
    const start = emptyTally();
    const next = addRolls(start, ['1', '1', '4']);
    expect(totalRolls(start)).toBe(0);
    expect(next['1']).toBe(2);
    expect(next['4']).toBe(1);
    expect(totalRolls(next)).toBe(3);
  });

  it('has no observed frequency before the first roll', () => {
    expect(observedFrequency(emptyTally())).toBeNull();
  });

  it('counts the watched event as the odd faces', () => {
    const tally = addRolls(emptyTally(), ['1', '2', '3', '4', '5', '6', '1']);
    expect(eventCount(tally)).toBe(4);
    expect(observedFrequency(tally)).toBeCloseTo(4 / 7);
  });

  it('exposes the theoretical probability from the tested model', () => {
    expect(theoreticalProbability()).toBe(0.5);
  });
});

describe('frequencyHistory', () => {
  it('is empty without rolls', () => {
    expect(frequencyHistory([])).toEqual([]);
  });

  it('reports the running frequency after each roll', () => {
    expect(frequencyHistory(['1', '2', '3', '4'])).toEqual([
      { rolls: 1, frequency: 1 },
      { rolls: 2, frequency: 0.5 },
      { rolls: 3, frequency: 2 / 3 },
      { rolls: 4, frequency: 0.5 },
    ]);
  });

  it('thins long runs but keeps the final roll', () => {
    const rolls = Array.from({ length: 1000 }, (_, index) => (index % 2 === 0 ? '1' : '2'));
    const points = frequencyHistory(rolls, 100);
    expect(points.length).toBeLessThanOrEqual(100);
    expect(points[points.length - 1]).toEqual({ rolls: 1000, frequency: 0.5 });
  });
});
