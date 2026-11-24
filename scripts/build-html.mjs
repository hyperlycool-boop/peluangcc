// Runs `next build` with NEXT_STATIC_EXPORT=1 (`npm run build:html`).
// A Node wrapper instead of an inline env assignment, so the script also works in Windows cmd.exe.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
const { status, error } = spawnSync(process.execPath, [nextBin, 'build'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_STATIC_EXPORT: '1' },
});

if (error) throw error;
process.exit(status ?? 1);
