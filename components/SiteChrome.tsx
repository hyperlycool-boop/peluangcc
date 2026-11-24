import Link from 'next/link';
import { SITE_PAGES, type SitePageId } from '@/lib/site-pages';

interface SubpageHeaderProps {
  current?: 'materi' | 'playground' | SitePageId;
  /** View-transition types for links that go back to the homepage. */
  homeTransitionTypes?: string[];
}

/** Header for every page except the homepage: brand plus the places a learner goes next. */
export function SubpageHeader({ current, homeTransitionTypes }: SubpageHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" transitionTypes={homeTransitionTypes}>
        <span className="brand-symbol" aria-hidden="true">
          <i />
          <i />
        </span>
        ruang peluang<span className="brand-dot">.</span>
      </Link>
      <nav aria-label="Navigasi halaman">
        {/* Beranda too, not only the logo: the way home should look like a way home. */}
        <Link className="nav-pill-item" href="/" transitionTypes={homeTransitionTypes}>
          Beranda
        </Link>
        <Link
          className={`nav-pill-item ${current === 'materi' ? 'is-active' : ''}`}
          href="/#materi"
          aria-current={current === 'materi' ? 'page' : undefined}
          transitionTypes={homeTransitionTypes}
        >
          Materi
        </Link>
        <Link
          className={`nav-pill-item ${current === 'playground' ? 'is-active' : ''}`}
          href="/playground"
          aria-current={current === 'playground' ? 'page' : undefined}
        >
          Taman bermain
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
