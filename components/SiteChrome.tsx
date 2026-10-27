import Link from 'next/link';
import { SITE_PAGES, type SitePageId } from '@/lib/site-pages';

interface SubpageHeaderProps {
  current?: 'materi' | SitePageId;
  /** View-transition types for links that go back to the homepage. */
  homeTransitionTypes?: string[];
}

/** Header for every page except the homepage: brand plus the three places a learner goes next. */
export function SubpageHeader({ current, homeTransitionTypes }: SubpageHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" transitionTypes={homeTransitionTypes}>
        ruang peluang.
      </Link>
      <nav aria-label="Navigasi halaman">
        <Link
          className={`nav-pill-item ${current === 'materi' ? 'is-active' : ''}`}
          href="/#materi"
          aria-current={current === 'materi' ? 'page' : undefined}
          transitionTypes={homeTransitionTypes}
        >
          Materi
        </Link>
        {SITE_PAGES.map((page) => (
          <Link
            key={page.id}
            className={`nav-pill-item ${current === page.id ? 'is-active' : ''}`}
            href={page.href}
            aria-current={current === page.id ? 'page' : undefined}
          >
            {page.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function FooterLinks() {
  return (
    <nav aria-label="Tautan situs" className="footer-links">
      <Link href="/#materi">Materi</Link>
      {SITE_PAGES.map((page) => (
        <Link key={page.id} href={page.href}>
          {page.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Link className="brand" href="/">
        ruang peluang<span className="brand-dot">.</span>
      </Link>
      <FooterLinks />
      <span>Lihat. Coba. Pahami.</span>
    </footer>
  );
}
