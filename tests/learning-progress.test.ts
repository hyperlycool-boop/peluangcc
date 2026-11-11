import { describe, expect, it } from 'vitest';
import {
  clearVisited,
  markVisited,
  nextLesson,
  parseVisited,
  readVisitedSnapshot,
  visitedFromSnapshot,
} from '../lib/learning-progress';

const SLUGS = ['a', 'b', 'c'];

function fakeStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set('ruang-peluang:visited-lessons', initial);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe('parseVisited', () => {
  it('returns nothing for empty, broken or non-array data', () => {
    expect(parseVisited(null, SLUGS)).toEqual([]);
    expect(parseVisited('{oops', SLUGS)).toEqual([]);
    expect(parseVisited('{"a":1}', SLUGS)).toEqual([]);
  });

  it('keeps known slugs once, in curriculum order, and drops the rest', () => {
    expect(parseVisited('["c","a","a","zzz",7]', SLUGS)).toEqual(['a', 'c']);
  });
});

describe('nextLesson', () => {
  it('suggests the first lesson not opened yet', () => {
    expect(nextLesson([], SLUGS)).toBe('a');
    expect(nextLesson(['a', 'c'], SLUGS)).toBe('b');
  });

  it('suggests nothing once everything was opened', () => {
    expect(nextLesson(SLUGS, SLUGS)).toBeNull();
  });
});

describe('storage round trip', () => {
  it('marks a real lesson, ignores an unknown one, and clears', () => {
    const storage = fakeStorage();
    markVisited('not-a-lesson', storage);
    expect(readVisitedSnapshot(storage)).toBe('');

    markVisited('ruang-sampel', storage);
    markVisited('ruang-sampel', storage);
    expect(visitedFromSnapshot(readVisitedSnapshot(storage))).toEqual(['ruang-sampel']);

    clearVisited(storage);
    expect(readVisitedSnapshot(storage)).toBe('');
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readVisitedSnapshot(broken)).toBe('');
    expect(() => markVisited('ruang-sampel', broken)).not.toThrow();
    expect(() => clearVisited(broken)).not.toThrow();
  });
});
