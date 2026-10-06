"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Profile } from "@/lib/types";

const control =
  "rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary";

const ENTITY_LABELS: Record<string, string> = {
  timetable: "Timetable",
  grade: "Grades",
  subject: "Subjects",
  snippet: "Snippets",
  profile: "Users",
  permission: "Permissions",
};

const ACTION_LABELS: Record<string, string> = {
  insert: "Added",
  update: "Changed",
  delete: "Removed",
};

export default function LogFilters({
  people,
  entities,
  actions,
}: {
  people: Profile[];
  entities: string[];
  actions: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // Any filter change invalidates the current page number.
    next.delete("page");
    startTransition(() => {
      router.push(`/admin/log?${next.toString()}`);
    });
  }

  const hasFilters = ["entity", "actor", "action", "from", "to"].some((k) =>
    params.get(k)
  );

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-on-surface-variant">What</span>
        <select
          value={params.get("entity") ?? ""}
          onChange={(e) => update("entity", e.target.value)}
          className={control}
        >
          <option value="">Everything</option>
          {entities.map((e) => (
            <option key={e} value={e}>
              {ENTITY_LABELS[e] ?? e}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-on-surface-variant">Action</span>
        <select
          value={params.get("action") ?? ""}
          onChange={(e) => update("action", e.target.value)}
          className={control}
        >
          <option value="">Any</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] ?? a}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-on-surface-variant">Who</span>
        <select
          value={params.get("actor") ?? ""}
          onChange={(e) => update("actor", e.target.value)}
          className={control}
        >
          <option value="">Anyone</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name || p.email}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-on-surface-variant">From</span>
        <input
          type="date"
          value={params.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value)}
          className={control}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-on-surface-variant">To</span>
        <input
          type="date"
          value={params.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value)}
          className={control}
        />
      </label>

      {hasFilters && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push("/admin/log"))}
          className="px-3 py-2 rounded-xl font-label-md border border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
        >
          Clear
        </button>
      )}

      {pending && (
        <span
          aria-hidden
          className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin self-center"
        />
      )}
    </section>
  );
}
