"use client";

import { useState, useTransition } from "react";
import {
  deleteRecording,
  saveScheduledRecording,
  updateRecording,
} from "@/app/admin/(protected)/actions";
import type { ActionResult } from "@/lib/types";
import type { ClassRow } from "./TodayBoard";

type Props = {
  row: ClassRow;
  /** Full title line including the date — what gets copied and posted. */
  title: string;
  date: string;
  canCopy: boolean;
  canRecord: boolean;
  isCopied: boolean;
  isNext: boolean;
  isLast: boolean;
  onCopyTitle: () => void;
  onToggleCopied: () => void;
  onResult: (result: ActionResult, success: string) => void;
};

/** Saves (or clears, with "") a row's link — extras by id, scheduled by class. */
export function saveRowUrl(row: ClassRow, date: string, url: string) {
  return row.recordingId !== null && row.gradeId === null
    ? updateRecording({ id: row.recordingId, url })
    : saveScheduledRecording({
        classDate: date,
        gradeId: row.gradeId!,
        subjectId: row.subjectId!,
        url,
        isCancelled: row.isCancelled,
      });
}

const iconBtn =
  "shrink-0 inline-flex items-center justify-center size-10 md:size-9 rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-40";

export default function RecordingRow({
  row,
  title,
  date,
  canCopy,
  canRecord,
  isCopied,
  isNext,
  isLast,
  onCopyTitle,
  onToggleCopied,
  onResult,
}: Props) {
  const committed = row.url ?? "";
  const [draft, setDraft] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);
  const [pending, startTransition] = useTransition();

  // Keep the box in step with the server value without an effect.
  if (lastCommitted !== committed) {
    setLastCommitted(committed);
    setDraft(committed);
  }

  function persist(
    work: () => Promise<ActionResult>,
    success: string,
    onFail?: () => void
  ) {
    startTransition(async () => {
      const result = await work();
      if (!result.ok) onFail?.();
      onResult(result, success);
    });
  }

  function saveUrl(value: string) {
    if (value.trim() === committed) return;
    persist(
      () => saveRowUrl(row, date, value),
      value.trim() ? "Link saved." : "Link cleared.",
      () => setDraft(committed)
    );
  }

  function toggleCancelled() {
    const next = !row.isCancelled;
    persist(
      () =>
        row.recordingId !== null && row.gradeId === null
          ? updateRecording({ id: row.recordingId, isCancelled: next })
          : saveScheduledRecording({
              classDate: date,
              gradeId: row.gradeId!,
              subjectId: row.subjectId!,
              url: row.url,
              isCancelled: next,
            }),
      next ? "Marked as not held." : "Marked as held."
    );
  }

  async function pasteLink() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      setDraft(text.trim());
      saveUrl(text.trim());
    } catch {
      onResult(
        { ok: false, error: "Couldn't read the clipboard — paste into the box instead." },
        ""
      );
    }
  }

  const tone = row.isCancelled
    ? "opacity-55"
    : isLast
      ? "bg-secondary-container/40"
      : isNext
        ? "bg-primary/5"
        : "hover:bg-surface-container-low";

  return (
    <li className={`px-4 md:px-6 py-3 flex flex-col gap-2 transition-colors ${tone}`}>
      <div className="flex items-center gap-3">
        {canCopy && !row.isCancelled && (
          <button
            type="button"
            onClick={onToggleCopied}
            aria-label={isCopied ? "Mark title as not copied" : "Mark title as copied"}
            title={isCopied ? "Title copied" : "Title not copied yet"}
            className={`shrink-0 material-symbols-outlined text-2xl rounded-full transition-colors ${
              isCopied ? "text-primary" : "text-outline hover:text-primary"
            }`}
            style={isCopied ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {isCopied ? "check_circle" : "radio_button_unchecked"}
          </button>
        )}

        <span
          className={`flex-1 min-w-0 text-base leading-6 md:text-lg md:leading-7 break-words ${
            row.isCancelled
              ? "text-on-surface-variant line-through decoration-1"
              : isCopied
                ? "text-on-surface-variant"
                : "text-on-surface"
          }`}
        >
          {title}
          {row.isExtra && (
            <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wide bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
              Extra
            </span>
          )}
        </span>

        {canCopy && isLast && !row.isCancelled && (
          <span className="shrink-0 hidden sm:inline text-xs font-semibold uppercase tracking-wide bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
            Last copied
          </span>
        )}
        {canCopy && isNext && (
          <span className="shrink-0 hidden sm:inline text-xs font-semibold uppercase tracking-wide bg-primary text-on-primary px-2 py-0.5 rounded-full">
            Next
          </span>
        )}

        {canCopy && !row.isCancelled && (
          <button
            type="button"
            onClick={onCopyTitle}
            aria-label={`Copy title: ${title}`}
            title="Copy title"
            className={iconBtn}
          >
            <span className="material-symbols-outlined text-xl">content_copy</span>
          </button>
        )}

        {canRecord && (
          <>
            <button
              type="button"
              onClick={toggleCancelled}
              disabled={pending}
              title={row.isCancelled ? "Mark as held" : "Mark as not held"}
              aria-label={row.isCancelled ? "Mark as held" : "Mark as not held"}
              className={`${iconBtn} ${
                row.isCancelled ? "text-error" : "hover:!text-error"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {row.isCancelled ? "event_busy" : "event_available"}
              </span>
            </button>
            {row.isExtra && (
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`Remove "${title}" from this day?`)) return;
                  persist(
                    () => deleteRecording(row.recordingId!),
                    "Removed from the day."
                  );
                }}
                disabled={pending || row.recordingId === null}
                title="Remove this extra class"
                aria-label="Remove this extra class"
                className={`${iconBtn} hover:!bg-error-container hover:!text-on-error-container`}
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            )}
          </>
        )}
      </div>

      {canRecord && !row.isCancelled && (
        <div className="flex items-center gap-2 pl-0 sm:pl-9">
          <span
            className={`material-symbols-outlined text-lg shrink-0 ${
              row.url ? "text-primary" : "text-outline"
            }`}
          >
            {row.url ? "link" : "link_off"}
          </span>
          <input
            type="url"
            inputMode="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => saveUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") setDraft(committed);
            }}
            placeholder="Paste the YouTube link…"
            spellCheck={false}
            className="flex-1 min-w-0 rounded-lg border border-outline-variant/60 bg-surface px-3 py-1.5 font-mono text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={pasteLink}
            disabled={pending}
            title="Paste from clipboard"
            aria-label="Paste link from clipboard"
            className={iconBtn}
          >
            <span className="material-symbols-outlined text-xl">content_paste</span>
          </button>
          {pending && (
            <span
              aria-hidden
              className="size-4 shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
            />
          )}
        </div>
      )}
    </li>
  );
}
