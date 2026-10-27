"use client";

import { useEffect } from 'react';
import { isCrossPageNavigation } from '@/lib/route-transition';

/**
 * Sets <html data-navigated> just before the first in-app page change,
 * so CSS page entrances play on a hard load but not on top of view transitions.
 */
export default function NavigationMarker() {
  useEffect(() => {
    const root = document.documentElement;

    function onClick(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (link instanceof HTMLAnchorElement && isCrossPageNavigation(link.href, location.href)) {
        mark();
      }
    }

    function mark() {
      root.dataset.navigated = '';
      cleanup();
    }

    function cleanup() {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', mark);
    }

    window.addEventListener('click', onClick, true);
    window.addEventListener('popstate', mark);
    return cleanup;
  }, []);

  return null;
}
