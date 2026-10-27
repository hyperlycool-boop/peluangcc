import { describe, it, expect } from 'vitest';
import { parseDisplayMode, isQuietMode, readDisplayMode } from '../lib/display-mode';

const storageWith = (value: string | null) => ({ getItem: () => value });

describe('Display mode parsing', () => {
  it('accepts the three known modes', () => {
    expect(parseDisplayMode('full')).toBe('full');
    expect(parseDisplayMode('calm')).toBe('calm');
    expect(parseDisplayMode('focus')).toBe('focus');
  });

  it('falls back to full for missing or unknown values', () => {
    expect(parseDisplayMode(null)).toBe('full');
    expect(parseDisplayMode('')).toBe('full');
    expect(parseDisplayMode('turbo')).toBe('full');
  });
});

describe('Quiet modes', () => {
  it('treats Tenang and Fokus ujian as quiet, Interaktif penuh as not', () => {
    expect(isQuietMode('full')).toBe(false);
    expect(isQuietMode('calm')).toBe(true);
    expect(isQuietMode('focus')).toBe(true);
  });
});

describe('Reading the saved mode', () => {
  it('reads and validates the stored value', () => {
    expect(readDisplayMode(storageWith('focus'))).toBe('focus');
    expect(readDisplayMode(storageWith('nonsense'))).toBe('full');
    expect(readDisplayMode(storageWith(null))).toBe('full');
  });

  it('falls back to full when storage is unavailable or throws', () => {
    expect(readDisplayMode(null)).toBe('full');
    expect(
      readDisplayMode({
        getItem: () => {
          throw new Error('blocked');
        },
      })
    ).toBe('full');
  });
});
