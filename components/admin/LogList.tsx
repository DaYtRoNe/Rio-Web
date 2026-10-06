"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatDateTime } from "@/lib/date";
import type { AuditEntry } from "@/lib/types";

const ACTION_STYLE: Record<string, { label: string; className: string; icon: string }> = {
  insert: {
    label: "Added",
    className: "bg-secondary-container text-on-secondary-container",
    icon: "add",
  },
  update: {
    label: "Changed",
    className: "bg-primary/15 text-primary",
    icon: "edit",
  },
  delete: {
    label: "Removed",
    className: "bg-error-container text-on-error-container",
    icon: "delete",
  },
};

const ENTITY_LABELS: Record<string, string> = {
  timetable: "Timetable",
  grade: "Grade",
  subject: "Subject",
  snippet: "Snippet",
  profile: "User",
  permission: "Permission",
};

/** Fields that are noise in a diff. */
const HIDDEN_FIELDS = new Set(["id", "created_at", "granted_at"]);

type Change = { field: string; before: unknown; after: unknown };

function diff(entry: AuditEntry): Change[] {
  const before = entry.before ?? {};
  const after = entry.after ?? {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes: Change[] = [];

  for (const key of keys) {
    if (HIDDEN_FIELDS.has(key)) continue;
    const b = before[key];
    const a = after[key];
    // For updates, only surface fields that actually moved.
    if (entry.action === "update" && JSON.stringify(b) === JSON.stringify(a)) {
      continue;
    }
    changes.push({ field: key, before: b, after: a });
  }
  return changes;
}

function show(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

export default function LogList({
  entries,
  page,
  lastPage,
  total,
}: {
  entries: AuditEntry[];
  page: number;
  lastPage: number;
  total: number;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const params = useSearchParams();

  function pageHref(n: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(n));
    return `/admin/log?${next.toString()}`;
  }

  if (entries.length === 0) {
    return (
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-6 py-12 text-center">
        <p className="font-body-md text-on-surface-variant">
          No changes match these filters.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
        <ul className="divide-y divide-outline-variant/20">
          {entries.map((entry) => {
            const style = ACTION_STYLE[entry.action] ?? ACTION_STYLE.update;
            const changes = diff(entry);
            const open = openId === entry.id;

            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : entry.id)}
                  className="w-full px-4 md:px-6 py-3 flex items-center gap-3 text-left hover:bg-surface-container-low transition-colors"
                >
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${style.className}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {style.icon}
                    </span>
                    <span className="hidden sm:inline">{style.label}</span>
                  </span>

                  <span className="shrink-0 hidden md:inline font-label-sm text-on-surface-variant w-24">
                    {ENTITY_LABELS[entry.entity] ?? entry.entity}
                  </span>

                  <span className="flex-1 min-w-0 font-body-md text-on-surface break-words">
                    {entry.label || entry.entity_id || "—"}
                  </span>

                  <span className="shrink-0 hidden lg:inline font-label-sm text-on-surface-variant truncate max-w-48">
                    {entry.actor_email ?? "system"}
                  </span>

                  <span className="shrink-0 font-label-sm text-on-surface-variant tabular-nums">
                    {formatDateTime(entry.created_at)}
                  </span>

                  <span className="material-symbols-outlined text-lg text-on-surface-variant shrink-0">
                    {open ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {open && (
                  <div className="px-4 md:px-6 pb-4 pt-1 bg-surface-container-low/50 flex flex-col gap-3">
                    <p className="font-label-sm text-on-surface-variant lg:hidden">
                      by {entry.actor_email ?? "system"}
                    </p>

                    {changes.length === 0 ? (
                      <p className="font-body-md text-on-surface-variant">
                        No field-level detail recorded.
                      </p>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="font-label-sm text-on-surface-variant">
                            <th className="py-1 pr-4 font-medium">Field</th>
                            <th className="py-1 pr-4 font-medium">Before</th>
                            <th className="py-1 font-medium">After</th>
                          </tr>
                        </thead>
                        <tbody className="align-top">
                          {changes.map((c) => (
                            <tr
                              key={c.field}
                              className="border-t border-outline-variant/20"
                            >
                              <td className="py-1.5 pr-4 font-label-md text-on-surface-variant whitespace-nowrap">
                                {c.field}
                              </td>
                              <td className="py-1.5 pr-4 font-body-md text-on-surface-variant break-words">
                                {show(c.before)}
                              </td>
                              <td className="py-1.5 font-body-md text-on-surface break-words">
                                {show(c.after)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {entry.entity === "snippet" && (
                      <p className="font-label-sm text-on-surface-variant">
                        Snippet contents are private and deliberately not recorded
                        here.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex items-center justify-between gap-4">
        <p className="font-label-sm text-on-surface-variant">
          Page {page} of {lastPage} · {total} change{total === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="px-3 py-2 rounded-xl font-label-md border border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary transition-colors"
            >
              ← Newer
            </Link>
          )}
          {page < lastPage && (
            <Link
              href={pageHref(page + 1)}
              className="px-3 py-2 rounded-xl font-label-md border border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary transition-colors"
            >
              Older →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
