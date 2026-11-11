import { materials } from './materials';

const STORAGE_KEY = 'ruang-peluang:visited-lessons';
const listeners = new Set<() => void>();

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function localStore(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Keeps only known lesson slugs, once each, in curriculum order. */
export function parseVisited(raw: string | null, slugs: readonly string[] = materials.map((m) => m.slug)): string[] {
  let stored: unknown;
  try {
    stored = raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
  if (!Array.isArray(stored)) return [];
  const seen = new Set(stored.filter((value): value is string => typeof value === 'string'));
  return slugs.filter((slug) => seen.has(slug));
}

/** The first lesson not opened yet, or null once every lesson was opened. */
export function nextLesson(visited: readonly string[], slugs: readonly string[] = materials.map((m) => m.slug)) {
  return slugs.find((slug) => !visited.includes(slug)) ?? null;
}

/**
 * Snapshot for useSyncExternalStore: a plain string, so equal progress compares equal
 * between renders. Split it back with `visitedFromSnapshot`.
 */
export function readVisitedSnapshot(storage: ReadableStorage | null = localStore()): string {
  try {
    return parseVisited(storage?.getItem(STORAGE_KEY) ?? null).join(',');
  } catch {
    return '';
  }
}

export function visitedFromSnapshot(snapshot: string): string[] {
  return snapshot ? snapshot.split(',') : [];
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function markVisited(slug: string, storage: WritableStorage | null = localStore()) {
  if (!materials.some((m) => m.slug === slug)) return;
  try {
    const visited = parseVisited(storage?.getItem(STORAGE_KEY) ?? null);
    if (visited.includes(slug)) return;
    storage?.setItem(STORAGE_KEY, JSON.stringify([...visited, slug]));
  } catch {
    // Storage blocked: the path simply shows no progress.
  }
  notify();
}

export function clearVisited(storage: WritableStorage | null = localStore()) {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is blocked.
  }
  notify();
}

export function subscribeVisited(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
