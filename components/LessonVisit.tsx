"use client";

import { useEffect } from 'react';
import { markVisited } from '@/lib/learning-progress';

/** Records that a lesson was opened, so the homepage learning path can tick it. Renders nothing. */
export default function LessonVisit({ slug }: { slug: string }) {
  useEffect(() => {
    markVisited(slug);
  }, [slug]);
  return null;
}
