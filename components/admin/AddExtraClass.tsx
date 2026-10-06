"use client";

import { useState, useTransition } from "react";
import { addExtraRecording } from "@/app/admin/(protected)/actions";
import type { ActionResult, Grade, Section, Subject } from "@/lib/types";

type Props = {
  date: string;
  sections: Section[];
  grades: Grade[];
  subjects: Subject[];
  defaultSectionId: number | null;
  onResult: (result: ActionResult, success: string) => void;
};

const field =
  "w-full rounded-lg border border-outline-variant/60 bg-surface px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

/** A class that wasn't on the timetable for this day. */
export default function AddExtraClass({
  date,
  sections,
  grades,
  subjects,
  defaultSectionId,
  onResult,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"class" | "custom">("class");
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [sectionId, setSectionId] = useState(String(defaultSectionId ?? ""));
  const [pending, startTransition] = useTransition();

  // Picking a grade implies its section, so the user doesn't choose twice.
  function chooseGrade(value: string) {
    setGradeId(value);
    const grade = grades.find((g) => String(g.id) === value);
    if (grade?.section_id) setSectionId(String(grade.section_id));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const section = Number(sectionId);
    if (!section) {
      onResult({ ok: false, error: "Choose a section." }, "");
      return;
    }

    startTransition(async () => {
      const result = await addExtraRecording({
        classDate: date,
        sectionId: section,
        gradeId: mode === "class" ? Number(gradeId) || null : null,
        subjectId: mode === "class" ? Number(subjectId) || null : null,
        customTitle: mode === "custom" ? customTitle.trim() || null : null,
      });
      if (result.ok) {
        setGradeId("");
        setSubjectId("");
        setCustomTitle("");
        setOpen(false);
      }
      onResult(result, "Extra class added.");
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-label-md border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Add extra class
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 md:p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-title-lg text-on-surface">Add extra class</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center justify-center size-9 rounded-lg text-on-surface-variant hover:bg-surface-variant/50"
          aria-label="Cancel"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div className="inline-flex self-start p-1 bg-surface-variant/60 rounded-xl">
        {(
          [
            ["class", "Existing grade & subject"],
            ["custom", "Type a title"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`px-3 py-1.5 rounded-lg font-label-md transition-colors ${
              mode === value
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3">
        {mode === "class" ? (
          <>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-sm text-on-surface-variant">Grade</span>
              <select
                value={gradeId}
                onChange={(e) => chooseGrade(e.target.value)}
                required
                className={field}
              >
                <option value="">Select grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-sm text-on-surface-variant">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className={field}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="font-label-sm text-on-surface-variant">Title</span>
            <input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. 10 ශ්‍රේණිය - විශේෂ පුනරීක්ෂණය"
              required
              maxLength={200}
              className={field}
            />
          </label>
        )}

        <label className="flex flex-col gap-1 w-full md:w-52">
          <span className="font-label-sm text-on-surface-variant">Section</span>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            required
            className={field}
          >
            <option value="">Select section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-label-md bg-primary text-on-primary disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add
        </button>
      </div>

      {mode === "custom" && (
        <p className="font-label-sm text-on-surface-variant">
          Type only the class name — the date is added automatically, so the line
          reads “{customTitle.trim() || "Your title"} ({date})”.
        </p>
      )}
    </form>
  );
}
