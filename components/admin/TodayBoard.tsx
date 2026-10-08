"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCopyTracker } from "@/lib/copy-tracker";
import {
  applyFormat,
  DEFAULT_FORMAT,
  FORMAT_TOKENS,
  useTitleFormat,
} from "@/lib/title-format";
import { WEEKDAYS } from "@/lib/date";
import type { MessageItem } from "@/lib/message";
import type { ActionResult, Grade, Section, Subject } from "@/lib/types";
import RecordingRow from "./RecordingRow";
import MessagePanel from "./MessagePanel";
import QuickLink, { type LinkTarget } from "./QuickLink";
import AddExtraClass from "./AddExtraClass";

export type ClassRow = {
  /** Stable React key; also used for the copied-marks store. */
  key: string;
  recordingId: number | null;
  gradeId: number | null;
  subjectId: number | null;
  grade: string;
  subject: string;
  customTitle: string | null;
  sectionId: number | null;
  sectionName: string;
  sectionHeading: string;
  sectionOrder: number;
  priority: number;
  url: string | null;
  isCancelled: boolean;
  isExtra: boolean;
};

type Props = {
  rows: ClassRow[];
  date: string;
  weekday: number;
  /** `today.copy` — the YouTube title workflow. */
  canCopy: boolean;
  /** `recordings.manage` — links, not-held marks and the message. */
  canRecord: boolean;
  sections: Section[];
  grades: Grade[];
  subjects: Subject[];
  defaultSectionId: number | null;
};

async function toClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt("Copy this text:", text);
  }
}

export default function TodayBoard({
  rows,
  date,
  weekday,
  canCopy,
  canRecord,
  sections,
  grades,
  subjects,
  defaultSectionId,
}: Props) {
  const { format, setFormat } = useTitleFormat();
  const { copied, lastKey, markCopied, unmark, reset } = useCopyTracker(date);
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 1400);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (notice === null) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  /** One-off rows use their typed title; scheduled ones use the template. */
  const items = useMemo(
    () =>
      rows.map((row) => ({
        row,
        title: row.customTitle
          ? `${row.customTitle} (${date})`
          : applyFormat(format, {
              grade: row.grade,
              subject: row.subject,
              date,
              day: WEEKDAYS[weekday],
            }),
      })),
    [rows, format, date, weekday]
  );

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? items.filter(
        ({ row }) =>
          row.grade.toLowerCase().includes(needle) ||
          row.subject.toLowerCase().includes(needle) ||
          (row.customTitle ?? "").toLowerCase().includes(needle)
      )
    : items;

  const next =
    visible.find(({ row }) => !row.isCancelled && !copied.has(row.key)) ?? null;
  const activeCount = items.filter(({ row }) => !row.isCancelled).length;
  const doneCount = items.filter(
    ({ row }) => !row.isCancelled && copied.has(row.key)
  ).length;
  const percent = activeCount ? Math.round((doneCount / activeCount) * 100) : 0;

  const messageItems: MessageItem[] = items.map(({ row, title }) => ({
    sectionHeading: row.sectionHeading,
    sectionOrder: row.sectionOrder,
    priority: row.priority,
    subject: row.subject,
    title,
    url: row.url,
    isCancelled: row.isCancelled,
  }));

  // Classes still waiting for a link: the ones whose titles were copied come
  // first, newest first, since that's the video that was just uploaded.
  const linkTargets = useMemo(() => {
    const waiting = new Map<string, LinkTarget>();
    if (canRecord) {
      for (const item of items) {
        if (!item.row.isCancelled && !item.row.url) waiting.set(item.row.key, item);
      }
    }
    const order = [lastKey, ...[...copied].reverse()];
    const fromCopied: LinkTarget[] = [];
    for (const key of order) {
      const target = key ? waiting.get(key) : undefined;
      if (target) {
        fromCopied.push(target);
        waiting.delete(key!);
      }
    }
    return { copied: fromCopied, rest: [...waiting.values()] };
  }, [items, copied, lastKey, canRecord]);
  const hasLinkTargets = linkTargets.copied.length + linkTargets.rest.length > 0;

  async function copyTitle(key: string, title: string) {
    await toClipboard(title);
    markCopied(key);
    setFlash(key);
  }

  function handleResult(result: ActionResult, success: string) {
    setNotice(
      result.ok ? { kind: "ok", text: success } : { kind: "error", text: result.error }
    );
  }

  // Press "c" anywhere outside a field to copy the next title.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
        return;
      }
      if (e.key.toLowerCase() === "c" && next && canCopy) {
        e.preventDefault();
        void copyTitle(next.row.key, next.title);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, canCopy]);

  // Rows arrive pre-sorted by section, so consecutive ones group naturally.
  const groups: { name: string; items: typeof visible }[] = [];
  for (const item of visible) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.row.sectionName) last.items.push(item);
    else groups.push({ name: item.row.sectionName, items: [item] });
  }

  const empty = rows.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Floats at the bottom so it's seen wherever the page is scrolled to. */}
      {notice && (
        <p
          role="status"
          className={`fixed z-50 inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:left-auto md:right-6 md:max-w-md px-4 py-3 rounded-xl shadow-lg font-label-md ${
            notice.kind === "ok"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-error-container text-on-error-container"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Next up — copy the title, then drop the link in right below it */}
      {!empty && (canCopy || hasLinkTargets) && (
        <section className="sticky top-0 z-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          {canCopy && (
            <>
              <div className="px-4 md:px-6 pt-3 md:pt-4 flex items-center justify-between gap-3">
                <span className="font-label-sm uppercase tracking-wide text-on-surface-variant">
                  {next ? "Next title" : "All titles copied"}
                </span>
                <span className="font-label-md text-on-surface-variant tabular-nums">
                  {doneCount} / {activeCount} copied
                </span>
              </div>

              <div className="px-4 md:px-6 pt-2">
                <div className="h-1.5 rounded-full bg-surface-variant overflow-hidden">
                  <div
                    className="h-full bg-primary transition-[width] duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
                {next ? (
                  <>
                    <p className="flex-1 min-w-0 text-base leading-6 md:text-lg md:leading-7 text-on-surface break-words">
                      {next.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyTitle(next.row.key, next.title)}
                      aria-label="Copy title"
                      className={`shrink-0 inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-3 rounded-xl font-label-md font-medium transition-colors ${
                        flash === next.row.key
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-primary text-on-primary hover:shadow-md"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {flash === next.row.key ? "check" : "content_copy"}
                      </span>
                      <span className="hidden sm:inline">Copy title</span>
                      <kbd className="hidden md:inline text-xs opacity-70 border border-current/40 rounded px-1">
                        C
                      </kbd>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="flex-1 min-w-0 text-base leading-6 md:text-lg md:leading-7 text-on-surface-variant">
                      {needle
                        ? "Everything matching this search is copied."
                        : `All ${activeCount} titles copied for ${WEEKDAYS[weekday]}.`}
                    </p>
                    <button
                      type="button"
                      onClick={reset}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-label-md border border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">restart_alt</span>
                      Start over
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {hasLinkTargets && (
            <QuickLink
              copied={linkTargets.copied}
              rest={linkTargets.rest}
              date={date}
              onResult={handleResult}
            />
          )}
        </section>
      )}

      {/* The day's message */}
      {canRecord && !empty && <MessagePanel date={date} items={messageItems} />}

      {/* Toolbar */}
      {!empty && (
        <section className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined text-xl absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Filter by grade or subject…"
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest pl-10 pr-3 py-2.5 font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {canCopy && doneCount > 0 && (
            <button
              type="button"
              onClick={reset}
              title="Clear copied marks for this day"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-label-md border border-outline-variant/60 text-on-surface-variant hover:border-error hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span>
              <span className="hidden sm:inline">Reset marks</span>
            </button>
          )}
        </section>
      )}

      {/* Class list, grouped by section */}
      {empty ? (
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-6 py-12 flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">
            event_busy
          </span>
          <p className="font-body-lg text-on-surface-variant">
            No classes scheduled for {WEEKDAYS[weekday]}.
          </p>
          <Link
            href={`/admin/timetable?day=${weekday}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add classes for {WEEKDAYS[weekday]}
          </Link>
        </section>
      ) : visible.length === 0 ? (
        <p className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-6 py-10 text-center font-body-md text-on-surface-variant">
          No classes match “{query}”.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <section
              key={group.name}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden"
            >
              <div className="px-4 md:px-6 py-2.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between gap-3">
                <h2 className="font-title-lg text-on-surface">{group.name}</h2>
                <span className="font-label-sm text-on-surface-variant tabular-nums">
                  {canRecord
                    ? `${group.items.filter((i) => i.row.url).length}/${group.items.length} links`
                    : group.items.length}
                </span>
              </div>
              <ul className="divide-y divide-outline-variant/20">
                {group.items.map(({ row, title }) => (
                  <RecordingRow
                    key={row.key}
                    row={row}
                    title={title}
                    date={date}
                    canCopy={canCopy}
                    canRecord={canRecord}
                    isCopied={copied.has(row.key)}
                    isNext={next?.row.key === row.key}
                    isLast={lastKey === row.key}
                    onCopyTitle={() => copyTitle(row.key, title)}
                    onToggleCopied={() =>
                      copied.has(row.key) ? unmark(row.key) : markCopied(row.key)
                    }
                    onResult={handleResult}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {canRecord && (
        <AddExtraClass
          date={date}
          sections={sections}
          grades={grades}
          subjects={subjects}
          defaultSectionId={defaultSectionId}
          onResult={handleResult}
        />
      )}

      {/* Title format */}
      {canCopy && !empty && (
        <details className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-4 md:px-6 py-3">
          <summary className="font-label-md text-on-surface-variant cursor-pointer select-none">
            Title format
          </summary>
          <div className="pt-3 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                spellCheck={false}
                className="flex-1 min-w-0 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 font-mono text-sm text-on-surface outline-none focus:border-primary"
              />
              {format !== DEFAULT_FORMAT && (
                <button
                  type="button"
                  onClick={() => setFormat(DEFAULT_FORMAT)}
                  className="shrink-0 px-3 py-2 rounded-xl font-label-md border border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                >
                  Reset to default
                </button>
              )}
            </div>
            <p className="font-label-sm text-on-surface-variant">
              Tokens: {FORMAT_TOKENS.join("  ")} · Preview:{" "}
              <span className="text-on-surface">{items[0]?.title}</span>
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
