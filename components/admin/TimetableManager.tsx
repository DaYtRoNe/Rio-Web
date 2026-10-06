"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { WEEKDAYS } from "@/lib/date";
import type { ActionResult, Grade, Subject, TimetableEntry } from "@/lib/types";
import { createEntry, updateEntry, deleteEntry } from "@/app/admin/(protected)/timetable/actions";

type Props = {
  weekday: number;
  entries: TimetableEntry[];
  grades: Grade[];
  subjects: Subject[];
  /** Without `timetable.manage` the timetable is read-only. */
  canManage: boolean;
};

const selectClass =
  "w-full rounded-lg border border-outline-variant/60 bg-surface px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const btnBase =
  "inline-flex items-center gap-1 px-3 py-2 rounded-lg font-label-md whitespace-nowrap transition-colors disabled:opacity-50";

// Monday-first tab order, like the old day dropdown
const TAB_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function TimetableManager({
  weekday,
  entries,
  grades,
  subjects,
  canManage,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const addFormRef = useRef<HTMLFormElement>(null);

  function run(work: () => Promise<ActionResult>, success: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await work();
      if (result.ok) {
        setMessage({ kind: "ok", text: success });
        setEditingId(null);
        addFormRef.current?.reset();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Weekday tabs */}
      <nav className="flex gap-1 overflow-x-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-1">
        {TAB_ORDER.map((d) => (
          <Link
            key={d}
            href={`/admin/timetable?day=${d}`}
            className={`flex-1 text-center px-3 py-2 rounded-xl font-label-md whitespace-nowrap transition-colors ${
              d === weekday
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-variant/50"
            }`}
          >
            <span className="md:hidden">{WEEKDAYS[d].slice(0, 3)}</span>
            <span className="hidden md:inline">{WEEKDAYS[d]}</span>
          </Link>
        ))}
      </nav>

      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between gap-4">
          <h1 className="font-title-lg text-on-surface">
            {WEEKDAYS[weekday]} · {entries.length} classes
          </h1>
          {message && (
            <p
              role="status"
              className={`font-label-md px-3 py-1 rounded-full ${
                message.kind === "ok"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-error-container text-on-error-container"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        {/* Add row */}
        {canManage && (
        <form
          ref={addFormRef}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => createEntry(fd), "Class added.");
          }}
          className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex flex-col md:flex-row md:items-end gap-3"
        >
          <input type="hidden" name="weekday" value={weekday} />
          <GradeSelect grades={grades} />
          <SubjectSelect subjects={subjects} />
          <button
            type="submit"
            disabled={pending}
            className={`${btnBase} bg-primary text-on-primary hover:shadow-md`}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add class
          </button>
        </form>
        )}

        {entries.length === 0 ? (
          <p className="px-6 py-10 text-center font-body-md text-on-surface-variant">
            No classes on {WEEKDAYS[weekday]}{canManage ? " yet." : "."}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/20">
            {entries.map((entry) =>
              canManage && editingId === entry.id ? (
                <li key={entry.id} className="px-6 py-3 bg-primary/5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      run(() => updateEntry(entry.id, fd), "Class updated.");
                    }}
                    className="flex flex-col md:flex-row md:items-end gap-3"
                  >
                    <GradeSelect grades={grades} defaultValue={entry.grade_id} />
                    <SubjectSelect subjects={subjects} defaultValue={entry.subject_id} />
                    <div className="flex gap-2">
                      <button type="submit" disabled={pending} className={`${btnBase} bg-primary text-on-primary`}>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className={`${btnBase} border border-outline-variant/60 text-on-surface-variant`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li
                  key={entry.id}
                  className="px-6 py-3 flex items-center gap-4 hover:bg-surface-container-low transition-colors"
                >
                  <span className="w-40 md:w-56 shrink-0 font-body-md font-semibold text-on-surface break-words">
                    {entry.grade.name}
                  </span>
                  <span className="flex-1 min-w-0 font-body-md text-on-surface break-words">
                    {entry.subject.name}
                  </span>
                  {canManage && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage(null);
                        setEditingId(entry.id);
                      }}
                      className={`${btnBase} text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary`}
                      aria-label="Edit"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!window.confirm("Remove this class from the timetable?")) return;
                        run(() => deleteEntry(entry.id), "Class removed.");
                      }}
                      className={`${btnBase} text-on-surface-variant hover:bg-error-container hover:text-on-error-container`}
                      aria-label="Delete"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                  )}
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function GradeSelect({ grades, defaultValue }: { grades: Grade[]; defaultValue?: number }) {
  return (
    <label className="flex flex-col gap-1 flex-1 min-w-0">
      <span className="font-label-sm text-on-surface-variant">Grade</span>
      <select name="grade_id" defaultValue={defaultValue ?? ""} required className={selectClass}>
        <option value="" disabled>
          Select grade
        </option>
        {grades.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubjectSelect({ subjects, defaultValue }: { subjects: Subject[]; defaultValue?: number }) {
  return (
    <label className="flex flex-col gap-1 flex-1 min-w-0">
      <span className="font-label-sm text-on-surface-variant">Subject</span>
      <select name="subject_id" defaultValue={defaultValue ?? ""} required className={selectClass}>
        <option value="" disabled>
          Select subject
        </option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
