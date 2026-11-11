"use client";

import { useEffect, useState } from 'react';

export const PAGE_MARKS = [
  { id: 'beranda', label: 'Awal' },
  { id: 'dadu', label: 'Dadu' },
  { id: 'coba', label: 'Coba sendiri' },
  { id: 'lab', label: 'Lab diagram' },
  { id: 'peta', label: 'Peta belajar' },
  { id: 'materi', label: 'Materi' },
] as const;

/** Slim rail on wide screens: where you are on the page, and a shortcut to each block. */
export default function SideProgress() {
  const [active, setActive] = useState<string>(PAGE_MARKS[0].id);

  useEffect(() => {
    let frame = 0;

    // The current block is the last one whose top has passed 40% of the viewport height.
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string = PAGE_MARKS[0].id;
      for (const mark of PAGE_MARKS) {
        const element = document.getElementById(mark.id);
        if (element && element.getBoundingClientRect().top <= line) current = mark.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className="side-progress" aria-label="Posisi di halaman">
      <ol>
        {PAGE_MARKS.map((mark) => (
          <li key={mark.id}>
            <a href={`#${mark.id}`} aria-current={active === mark.id ? 'location' : undefined}>
              <span className="side-progress-label">{mark.label}</span>
              <span className="side-progress-dot" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
