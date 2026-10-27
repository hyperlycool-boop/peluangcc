export type DisplayMode = 'full' | 'calm' | 'focus';

const STORAGE_KEY = 'ruang-peluang:display-mode';
const listeners = new Set<() => void>();

type ReadableStorage = Pick<Storage, 'getItem'>;

export function parseDisplayMode(value: string | null): DisplayMode {
  return value === 'calm' || value === 'focus' ? value : 'full';
}

/** Tenang and Fokus ujian ask for less motion, including page transitions. */
export function isQuietMode(mode: DisplayMode): boolean {
  return mode !== 'full';
}

function sessionStore(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readDisplayMode(storage: ReadableStorage | null = sessionStore()): DisplayMode {
  try {
    return parseDisplayMode(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return 'full';
  }
}

/** <html data-motion="quiet"> lets CSS calm document-level motion such as view transitions. */
function applyToDocument(mode: DisplayMode) {
  const root = document.documentElement;
  if (isQuietMode(mode)) root.dataset.motion = 'quiet';
  else delete root.dataset.motion;
}

export function setDisplayMode(mode: DisplayMode) {
  try {
    sessionStore()?.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage blocked: the mode still applies for this page.
  }
  applyToDocument(mode);
  listeners.forEach((listener) => listener());
}

/** useSyncExternalStore subscribe: also syncs the document attribute with the saved mode. */
export function subscribeDisplayMode(listener: () => void) {
  listeners.add(listener);
  applyToDocument(readDisplayMode());
  return () => {
    listeners.delete(listener);
  };
}
