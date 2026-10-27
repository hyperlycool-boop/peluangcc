import { ViewTransition } from 'react';
import Experience from '@/components/Experience';
import { DIRECTIONAL_PAGE_TRANSITION } from '@/lib/route-transition';

export default function PrototypePage() {
  return (
    <ViewTransition {...DIRECTIONAL_PAGE_TRANSITION}>
      <Experience prototype={true} folding={true} />
    </ViewTransition>
  );
}
