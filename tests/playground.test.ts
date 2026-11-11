import { describe, expect, it } from 'vitest';
import {
  PLAYGROUND_TOOLS,
  eventStats,
  rollTool,
  tallyRolls,
  toggleMember,
} from '../lib/playground';

const [die, coin, spinner] = PLAYGROUND_TOOLS;

describe('rollTool', () => {
  it('reaches every outcome of every tool, and never goes past the last one', () => {
    for (const tool of PLAYGROUND_TOOLS) {
      const seen = new Set(tool.outcomes.map((_, index) => rollTool(tool, () => (index + 0.5) / tool.outcomes.length)));
      expect(seen.size).toBe(tool.outcomes.length);
      expect(tool.outcomes).toContain(rollTool(tool, () => 1));
    }
  });
});

describe('tallyRolls', () => {
  it('counts each outcome and ignores strangers', () => {
    expect(tallyRolls(coin, ['Angka', 'Gambar', 'Angka', 'Dadu'])).toEqual({ Angka: 2, Gambar: 1 });
  });
});

describe('toggleMember', () => {
  it('adds and removes outcomes in the tool order', () => {
    const once = toggleMember(spinner, [], 'Hijau');
    const twice = toggleMember(spinner, once, 'Merah');
    expect(twice).toEqual(['Merah', 'Hijau']);
    expect(toggleMember(spinner, twice, 'Hijau')).toEqual(['Merah']);
  });

  it('refuses outcomes that are not on the tool', () => {
    expect(toggleMember(coin, ['Angka'], '6')).toEqual(['Angka']);
  });
});

describe('eventStats', () => {
  it('matches the model for each tool', () => {
    expect(eventStats(die, ['1', '3', '5'], []).theoretical).toBe(0.5);
    expect(eventStats(coin, ['Angka'], []).theoretical).toBe(0.5);
    expect(eventStats(spinner, ['Merah', 'Biru'], []).theoretical).toBeCloseTo(2 / 3);
    expect(eventStats(die, [], []).theoretical).toBe(0);
    expect(eventStats(die, die.outcomes, []).theoretical).toBe(1);
  });

  it('has no observed share before the first roll, then counts hits', () => {
    expect(eventStats(coin, ['Angka'], []).observed).toBeNull();
    const stats = eventStats(coin, ['Angka'], ['Angka', 'Gambar', 'Angka', 'Angka']);
    expect(stats).toMatchObject({ favourable: 1, sampleSize: 2, trials: 4, hits: 3, observed: 0.75 });
  });
});
