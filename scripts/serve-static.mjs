// Minimal static file server for the HTML export in `out/` (`npm run preview:html`).
// Resolves clean URLs (/materi/x/ -> /materi/x/index.html) and serves 404.html
// for unknown paths, like a typical static host would.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'out');
const port = Number(process.env.PORT ?? process.argv[3] ?? 3300);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

async function resolveFile(decodedPath) {
  const safe = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const target = join(root, safe);
  if (!target.startsWith(root)) return null;
  const directoryIndex = join(target, 'index.html');
  for (const candidate of [target, directoryIndex, `${target}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) {
        return { file: candidate, isDirectoryIndex: candidate === directoryIndex };
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

createServer(async (req, res) => {
  let url;
  let decodedPath;
  try {
    url = new URL(req.url ?? '/', 'http://localhost');
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const found = await resolveFile(decodedPath);
  // Static hosts redirect a directory URL to its trailing-slash form.
  if (found?.isDirectoryIndex && !decodedPath.endsWith('/')) {
    const location = `${url.pathname.replace(/^\/+/, '/')}/${url.search}`;
    res.writeHead(301, { Location: location }).end();
    return;
  }
  const path = found?.file ?? join(root, '404.html');
  try {
    const body = await readFile(path);
    res.writeHead(found ? 200 : 404, {
      'Content-Type': types[extname(path)] ?? 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
