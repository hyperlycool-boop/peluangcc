import { ViewTransition } from 'react';
import Experience from '@/components/Experience';
import { DIRECTIONAL_PAGE_TRANSITION } from '@/lib/route-transition';

export default function Page() {
  return (
    <ViewTransition {...DIRECTIONAL_PAGE_TRANSITION}>
      <Experience styleguide />
    </ViewTransition>
  );
}
