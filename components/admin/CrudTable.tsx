"use client";

import { useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/types";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "checkbox";
  placeholder?: string;
  /** Tailwind width class for the column, e.g. "w-24" */
  width?: string;
  /**
   * Name of a boolean field on the same row; when it is true this column is
   * shown as "••••••••" instead of its value (used for secret snippets).
   */
  maskWhen?: string;
};

type Item = { id: number } & Record<string, unknown>;

type Props<T extends Item> = {
  title: string;
  items: T[];
  fields: Field[];
  addLabel?: string;
  deleteWarning?: string;
  onCreate: (formData: FormData) => Promise<ActionResult>;
  onUpdate: (id: number, formData: FormData) => Promise<ActionResult>;
  onDelete: (id: number) => Promise<ActionResult>;
};

const inputClass =
  "w-full rounded-lg border border-outline-variant/60 bg-surface px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const btnBase =
  "inline-flex items-center gap-1 px-3 py-2 rounded-lg font-label-md whitespace-nowrap transition-colors disabled:opacity-50";

/**
 * Generic add / inline-edit / delete table used by the Grades, Subjects and
 * Snippets screens. Mirrors the old desktop forms: one add row at the top,
 * click a row to edit it in place.
 */
export default function CrudTable<T extends Item>({
  title,
  items,
  fields,
  addLabel = "Add",
  deleteWarning = "Delete this entry?",
  onCreate,
  onUpdate,
  onDelete,
}: Props<T>) {
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

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => onCreate(fd), "Added.");
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => onUpdate(id, fd), "Updated.");
  }

  function handleDelete(id: number) {
    if (!window.confirm(deleteWarning)) return;
    run(() => onDelete(id), "Deleted.");
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between gap-4">
        <h1 className="font-title-lg text-on-surface">
          {title} · {items.length}
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
      <form
        ref={addFormRef}
        onSubmit={handleCreate}
        className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex flex-col md:flex-row md:items-end gap-3"
      >
        {fields.map((f) => (
          <FieldInput key={f.name} field={f} />
        ))}
        <button
          type="submit"
          disabled={pending}
          className={`${btnBase} bg-primary text-on-primary hover:shadow-md`}
        >
          <span className="material-symbols-outlined text-lg">add</span>
          {addLabel}
        </button>
      </form>

      {/* Rows */}
      {items.length === 0 ? (
        <p className="px-6 py-10 text-center font-body-md text-on-surface-variant">
          Nothing here yet.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant/20">
          {items.map((item) =>
            editingId === item.id ? (
              <li key={item.id} className="px-6 py-3 bg-primary/5">
                <form
                  onSubmit={(e) => handleUpdate(e, item.id)}
                  className="flex flex-col md:flex-row md:items-end gap-3"
                >
                  {fields.map((f) => (
                    <FieldInput key={f.name} field={f} defaultValue={item[f.name]} />
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className={`${btnBase} bg-primary text-on-primary`}
                    >
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
                key={item.id}
                className="px-6 py-3 flex items-center gap-4 hover:bg-surface-container-low transition-colors"
              >
                {fields.map((f) => (
                  <span
                    key={f.name}
                    className={`font-body-md text-on-surface break-words ${
                      f.width ?? "flex-1 min-w-0"
                    }`}
                  >
                    {displayValue(f, item)}
                  </span>
                ))}
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMessage(null);
                      setEditingId(item.id);
                    }}
                    className={`${btnBase} text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary`}
                    aria-label="Edit"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(item.id)}
                    className={`${btnBase} text-on-surface-variant hover:bg-error-container hover:text-on-error-container`}
                    aria-label="Delete"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </section>
  );
}

/** Read-only cell text. Field config must stay serialisable (it crosses the server → client boundary). */
function displayValue(field: Field, item: Item): React.ReactNode {
  const value = item[field.name];
  if (field.type === "checkbox") {
    return value ? (
      <span className="material-symbols-outlined text-lg text-on-surface-variant" title={field.label}>
        lock
      </span>
    ) : null;
  }
  if (field.maskWhen && item[field.maskWhen]) {
    return "••••••••";
  }
  return String(value ?? "");
}

function FieldInput({ field, defaultValue }: { field: Field; defaultValue?: unknown }) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 font-label-md text-on-surface-variant py-2">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(defaultValue)}
          className="size-4 accent-primary"
        />
        {field.label}
      </label>
    );
  }
  return (
    <label className={`flex flex-col gap-1 ${field.width ?? "flex-1 min-w-0"}`}>
      <span className="font-label-sm text-on-surface-variant">{field.label}</span>
      <input
        name={field.name}
        type={field.type ?? "text"}
        placeholder={field.placeholder}
        defaultValue={defaultValue as string | number | undefined}
        required
        className={inputClass}
      />
    </label>
  );
}
