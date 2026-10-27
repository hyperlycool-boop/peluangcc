import { describe, it, expect } from 'vitest';
import {
  NAV_FORWARD,
  NAV_BACK,
  DIRECTIONAL_PAGE_TRANSITION,
  lessonTitleTransitionName,
  lessonNavTypes,
  isCrossPageNavigation,
} from '../lib/route-transition';
import { materials } from '../lib/materials';

describe('Lesson title shared-element name', () => {
  it('is stable and unique per lesson slug', () => {
    const names = materials.map((m) => lessonTitleTransitionName(m.slug));
    expect(new Set(names).size).toBe(materials.length);
    expect(lessonTitleTransitionName('ruang-sampel')).toBe('lesson-title-ruang-sampel');
  });

  it('only produces characters valid in a CSS view-transition-name', () => {
    expect(lessonTitleTransitionName('Bebas & Bersyarat!')).toMatch(/^lesson-title-[a-z0-9-]+$/);
  });
});

describe('Lesson navigation direction', () => {
  it('goes forward to a later lesson and back to an earlier one', () => {
    expect(lessonNavTypes(0, 1)).toEqual([NAV_FORWARD]);
    expect(lessonNavTypes(3, 1)).toEqual([NAV_BACK]);
  });

  it('treats the homepage (index -1) as the start of the journey', () => {
    expect(lessonNavTypes(-1, 2)).toEqual([NAV_FORWARD]);
    expect(lessonNavTypes(2, -1)).toEqual([NAV_BACK]);
  });

  it('adds no direction when staying on the same page', () => {
    expect(lessonNavTypes(2, 2)).toEqual([]);
  });
});

describe('Directional page transition map', () => {
  it('maps both nav types for enter and exit and is inert otherwise', () => {
    for (const phase of ['enter', 'exit'] as const) {
      expect(DIRECTIONAL_PAGE_TRANSITION[phase]).toEqual({
        [NAV_FORWARD]: NAV_FORWARD,
        [NAV_BACK]: NAV_BACK,
        default: 'none',
      });
    }
    expect(DIRECTIONAL_PAGE_TRANSITION.default).toBe('none');
  });
});

describe('Cross-page navigation detection', () => {
  const here = 'http://127.0.0.1:3100/materi/ruang-sampel';

  it('is true for another page on the same origin', () => {
    expect(isCrossPageNavigation('http://127.0.0.1:3100/', here)).toBe(true);
    expect(isCrossPageNavigation('http://127.0.0.1:3100/materi/bebas-bersyarat', here)).toBe(true);
    expect(isCrossPageNavigation('http://127.0.0.1:3100/#materi', here)).toBe(true);
  });

  it('is false for in-page hash links and query-only changes', () => {
    expect(isCrossPageNavigation('http://127.0.0.1:3100/materi/ruang-sampel#x', here)).toBe(false);
    expect(isCrossPageNavigation('http://127.0.0.1:3100/materi/ruang-sampel?a=1', here)).toBe(false);
  });

  it('is false for other origins and unparseable hrefs', () => {
    expect(isCrossPageNavigation('https://example.com/materi', here)).toBe(false);
    expect(isCrossPageNavigation('http://[bad', here)).toBe(false);
  });
});
