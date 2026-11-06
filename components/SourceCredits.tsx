import Link from 'next/link';
import { getCitation, STATUS_LABEL } from '@/lib/citations';

interface SourceCreditsProps {
  ids: readonly string[];
  /** One sentence on who wrote what, shown under the list. */
  note: string;
}

/** Short source list for a lesson or exercise page; full entries live on /referensi. */
export function SourceCredits({ ids, note }: SourceCreditsProps) {
  return (
    <section className="source-credits" aria-labelledby="sumber-heading">
      <h2 id="sumber-heading">Sumber</h2>
      <ul>
        {ids.map((id) => {
          const c = getCitation(id);
          return (
            <li key={id}>
              <Link href={`/referensi#${c.id}`}>
                {c.author}
                {c.year ? ` (${c.year})` : ''}. <em>{c.title}</em>
              </Link>
              <span className="source-status">{STATUS_LABEL[c.status]}</span>
            </li>
          );
        })}
      </ul>
      <p>
        {note} <Link href="/referensi#ilustrasi">Ilustrasi dan simulasi</Link> dibuat untuk proyek ini.
      </p>
    </section>
  );
}
