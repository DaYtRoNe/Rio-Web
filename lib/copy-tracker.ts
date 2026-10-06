"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  pruneLocal,
  readLocal,
  subscribeLocalStore,
  writeLocal,
} from "./local-store";

const PREFIX = "rio-admin-copied:";
/** Days of history to keep before pruning. */
const KEEP_DAYS = 21;

type Stored = { copied: string[]; last: string | null };

/** Stable reference for SSR and the hydration render. */
const EMPTY: Stored = { copied: [], last: null };

function keyFor(date: string) {
  return PREFIX + date;
}

function parse(raw: string | null): Stored {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      copied: Array.isArray(parsed.copied)
        ? parsed.copied.filter((v): v is string => typeof v === "string")
        : [],
      last: typeof parsed.last === "string" ? parsed.last : null,
    };
  } catch {
    return EMPTY;
  }
}

function serialize(value: Stored): string | null {
  return value.copied.length === 0 ? null : JSON.stringify(value);
}

/**
 * Remembers which class titles have already been copied on a given date, so you
 * can work down the list across reloads and tab switches without re-reading the
 * titles you already used. Per-date, and local to this browser.
 *
 * Keys are the row keys from the Today screen, which cover both scheduled
 * classes and one-off extras.
 */
export function useCopyTracker(date: string) {
  const key = keyFor(date);

  const state = useSyncExternalStore(
    subscribeLocalStore,
    () => readLocal(key, parse),
    () => EMPTY
  );

  // Drop old days once per mount. No state involved, so no extra render.
  useEffect(() => {
    const cutoff = new Date(`${date}T00:00:00Z`);
    cutoff.setUTCDate(cutoff.getUTCDate() - KEEP_DAYS);
    const cutoffKey = PREFIX + cutoff.toISOString().slice(0, 10);
    pruneLocal((k) => k.startsWith(PREFIX) && k < cutoffKey);
  }, [date]);

  const markCopied = useCallback(
    (id: string) => {
      const current = readLocal(key, parse);
      const copied = current.copied.includes(id)
        ? current.copied
        : [...current.copied, id];
      writeLocal(key, { copied, last: id }, serialize);
    },
    [key]
  );

  const unmark = useCallback(
    (id: string) => {
      const current = readLocal(key, parse);
      writeLocal(
        key,
        {
          copied: current.copied.filter((x) => x !== id),
          last: current.last === id ? null : current.last,
        },
        serialize
      );
    },
    [key]
  );

  const reset = useCallback(() => writeLocal(key, EMPTY, serialize), [key]);

  const copied = useMemo(() => new Set(state.copied), [state]);

  return {
    copied,
    lastKey: state.last,
    count: state.copied.length,
    markCopied,
    unmark,
    reset,
  };
}
