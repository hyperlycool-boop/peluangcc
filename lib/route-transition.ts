export const NAV_FORWARD = 'nav-forward';
export const NAV_BACK = 'nav-back';

/** Position of the homepage in the learning journey; lessons are 0..n-1. */
export const HOME_INDEX = -1;

/** Page-level <ViewTransition> props: slide by navigation direction, stay still otherwise. */
export const DIRECTIONAL_PAGE_TRANSITION = {
  enter: { [NAV_FORWARD]: NAV_FORWARD, [NAV_BACK]: NAV_BACK, default: 'none' },
  exit: { [NAV_FORWARD]: NAV_FORWARD, [NAV_BACK]: NAV_BACK, default: 'none' },
  default: 'none',
} as const;

/** Shared-element name pairing a lesson's title in the Materi list with its lesson page heading. */
export function lessonTitleTransitionName(slug: string): string {
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return `lesson-title-${safe}`;
}

/**
 * Transition types for a link between two points of the learning journey.
 * The homepage is index -1, lessons are 0..n-1 in curriculum order.
 */
export function lessonNavTypes(fromIndex: number, toIndex: number): string[] {
  if (toIndex === fromIndex) return [];
  return [toIndex > fromIndex ? NAV_FORWARD : NAV_BACK];
}

/** True when following `targetHref` from `currentHref` loads a different page of this site. */
export function isCrossPageNavigation(targetHref: string, currentHref: string): boolean {
  try {
    const target = new URL(targetHref, currentHref);
    const current = new URL(currentHref);
    return target.origin === current.origin && target.pathname !== current.pathname;
  } catch {
    return false;
  }
}
