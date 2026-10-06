"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readLocal, subscribeLocalStore, writeLocal } from "./local-store";

const STORAGE_KEY = "rio-admin-title-format";

/** The format the old desktop app produced, kept as the default. */
export const DEFAULT_FORMAT = "{grade} - {subject} ({date})";

export const FORMAT_TOKENS = ["{grade}", "{subject}", "{date}", "{day}"] as const;

export type TitleParts = {
  grade: string;
  subject: string;
  date: string;
  day: string;
};

export function applyFormat(format: string, parts: TitleParts): string {
  return format
    .replace(/\{grade\}/g, parts.grade)
    .replace(/\{subject\}/g, parts.subject)
    .replace(/\{date\}/g, parts.date)
    .replace(/\{day\}/g, parts.day);
}

function parse(raw: string | null): string {
  return raw ?? DEFAULT_FORMAT;
}

/** Copy/title template, remembered per browser. */
export function useTitleFormat() {
  const format = useSyncExternalStore(
    subscribeLocalStore,
    () => readLocal(STORAGE_KEY, parse),
    () => DEFAULT_FORMAT
  );

  const setFormat = useCallback((next: string) => {
    writeLocal(STORAGE_KEY, next, (v) => (v === DEFAULT_FORMAT ? null : v));
  }, []);

  return { format, setFormat };
}
