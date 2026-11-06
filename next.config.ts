import type { NextConfig } from 'next';

// `npm run build:html` sets NEXT_STATIC_EXPORT=1 and emits a plain-HTML
// version of the site to `out/` (one prerendered .html file per route plus
// the React 19 client bundles that hydrate it). Every route in this app is
// static — no server actions, cookies, route handlers or proxy — so the
// exported site keeps the same client-side behaviour as `next start`.
// A plain `npm run build` is unchanged.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === '1';

const nextConfig: NextConfig = isStaticExport
  ? {
      output: 'export',
      // /materi/foo/index.html instead of /materi/foo.html, so any static
      // file server resolves clean URLs without rewrite rules.
      trailingSlash: true,
      // In Next 16 the exported site is written into distDir itself. Using
      // `out` keeps it apart from `.next`, so an export never clobbers a
      // running dev server.
      distDir: 'out',
    }
  : {};

export default nextConfig;
