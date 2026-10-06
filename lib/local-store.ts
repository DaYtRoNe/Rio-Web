"use client";

/**
 * Minimal localStorage-backed external store for `useSyncExternalStore`.
 *
 * Reading localStorage directly from a render would break SSR and hydration, and
 * loading it in an effect causes a cascading re-render. This keeps a parsed
 * value cached per key so `getSnapshot` can return a stable reference, and
 * notifies subscribers on every write — including writes from another tab.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
const cache = new Map<string, unknown>();
let bound = false;

function emit() {
  for (const listener of listeners) listener();
}

function bindStorageEvent() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  // Fired when another tab writes; drop the cache so values are re-read.
  window.addEventListener("storage", () => {
    cache.clear();
    emit();
  });
}

export function subscribeLocalStore(listener: Listener) {
  bindStorageEvent();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Parsed value for `key`, memoised so repeated snapshots are reference-equal. */
export function readLocal<T>(key: string, parse: (raw: string | null) => T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // Private mode or blocked storage.
  }
  const value = parse(raw);
  cache.set(key, value);
  return value;
}

/** Writes `value` and notifies subscribers. `serialize` returning null removes the key. */
export function writeLocal<T>(
  key: string,
  value: T,
  serialize: (value: T) => string | null
) {
  cache.set(key, value);
  try {
    const raw = serialize(value);
    if (raw === null) localStorage.removeItem(key);
    else localStorage.setItem(key, raw);
  } catch {
    // Value still lives in the cache for this page view.
  }
  emit();
}

/** Removes every stored key matching `predicate` (used to prune old history). */
export function pruneLocal(predicate: (key: string) => boolean) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && predicate(key)) {
        localStorage.removeItem(key);
        cache.delete(key);
      }
    }
  } catch {
    // ignore
  }
}
