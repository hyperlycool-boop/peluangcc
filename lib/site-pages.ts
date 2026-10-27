/** Standalone pages reachable from the header nav and the footer, besides the homepage sections. */
export const SITE_PAGES = [
  { id: 'referensi', href: '/referensi', label: 'Referensi' },
] as const;

export type SitePageId = (typeof SITE_PAGES)[number]['id'];
