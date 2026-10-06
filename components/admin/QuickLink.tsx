"use client";

import { useEffect, useState, useTransition } from "react";
import { isYouTubeUrl } from "@/lib/youtube";
import type { ActionResult } from "@/lib/types";
import { iconBtn, saveRowUrl } from "./RecordingRow";
import type { ClassRow } from "./TodayBoard";

export type LinkTarget = { row: ClassRow; title: string };

type Props = {
  /** Classes whose titles were copied but still have no link, newest first. */
  copied: LinkTarget[];
  /** Every other class still missing a link, in board order. */
  rest: LinkTarget[];
  date: string;
  onResult: (result: ActionResult, success: string) => void;
};

function isField(el: EventTarget | null) {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
  );
}

/**
 * The link half of the upload loop, living in the sticky bar next to the title
 * you just copied. Copy the title, paste it into YouTube, copy the video link,
 * come back and press Ctrl+V — no scrolling to find the row.
 *
 * Defaults to the most recently copied class that still needs a link; the
 * picker covers the case where uploads finish out of order.
 */
export default function QuickLink({ copied, rest, date, onResult }: Props) {
  const all = [...copied, ...rest];
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const target = all.find((t) => t.row.key === pickedKey) ?? all[0];
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  function save(raw: string) {
    const value = raw.trim();
    if (!value || pending) return;
    if (!isYouTubeUrl(value)) {
      setDraft(value);
      onResult({ ok: false, error: "That doesn't look like a YouTube link." }, "");
      return;
    }
    const { row, title } = target;
    setDraft(value);
    startTransition(async () => {
      const result = await saveRowUrl(row, date, value);
      if (result.ok) {
        setDraft("");
        setPickedKey(null);
      }
      onResult(result, `Link saved for ${title}.`);
    });
  }

  // Ctrl+V anywhere outside a field drops the link into the slot.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (isField(e.target)) return;
      const text = e.clipboardData?.getData("text") ?? "";
      if (!text.trim()) return;
      e.preventDefault();
      save(text);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, pending]);

  async function pasteFromClipboard() {
    try {
      save(await navigator.clipboard.readText());
    } catch {
      onResult(
        { ok: false, error: "Couldn't read the clipboard — paste into the box instead." },
        ""
      );
    }
  }

  const option = (t: LinkTarget) => (
    <option key={t.row.key} value={t.row.key}>
      {t.title}
    </option>
  );

  return (
    <div className="px-4 md:px-6 py-3 border-t border-outline-variant/20 bg-surface-container-low/60 flex flex-col md:flex-row md:items-center gap-2">
      <label className="flex items-center gap-2 min-w-0 md:max-w-[50%]">
        <span className="material-symbols-outlined text-lg text-primary shrink-0">
          add_link
        </span>
        <span className="font-label-sm uppercase tracking-wide text-on-surface-variant shrink-0">
          Link for
        </span>
        {all.length > 1 ? (
          <select
            value={target.row.key}
            onChange={(e) => setPickedKey(e.target.value)}
            disabled={pending}
            className="min-w-0 flex-1 truncate rounded-lg border border-outline-variant/60 bg-surface px-2 py-1.5 font-body-md text-on-surface outline-none focus:border-primary"
          >
            {copied.length > 0 && rest.length > 0 ? (
              <>
                <optgroup label="Copied, waiting for a link">
                  {copied.map(option)}
                </optgroup>
                <optgroup label="Not copied yet">{rest.map(option)}</optgroup>
              </>
            ) : (
              all.map(option)
            )}
          </select>
        ) : (
          <span className="min-w-0 truncate font-body-md text-on-surface">
            {target.title}
          </span>
        )}
      </label>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <input
          type="url"
          inputMode="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            save(e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save(draft);
            }
            if (e.key === "Escape") setDraft("");
          }}
          disabled={pending}
          placeholder="Paste the YouTube link — Ctrl+V works anywhere"
          spellCheck={false}
          aria-label={`YouTube link for ${target.title}`}
          className="flex-1 min-w-0 rounded-lg border border-outline-variant/60 bg-surface px-3 py-1.5 font-mono text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={pasteFromClipboard}
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
    </div>
  );
}
