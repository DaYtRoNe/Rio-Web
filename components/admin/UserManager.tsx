"use client";

import { useRef, useState, useTransition } from "react";
import type { ActionResult, Feature, Profile } from "@/lib/types";
import {
  createUser,
  deleteUser,
  setActive,
  setPermission,
  setRole,
} from "@/app/admin/(protected)/users/actions";

export type UserRow = Profile & { features: string[] };

type Props = {
  users: UserRow[];
  features: Feature[];
  currentUserId: string;
  canCreateUsers: boolean;
};

const btn =
  "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-label-md whitespace-nowrap transition-colors disabled:opacity-50";
const input =
  "w-full rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function UserManager({
  users,
  features,
  currentUserId,
  canCreateUsers,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const addFormRef = useRef<HTMLFormElement>(null);

  function run(work: () => Promise<ActionResult>, success: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await work();
      setMessage(
        result.ok
          ? { kind: "ok", text: success }
          : { kind: "error", text: result.error }
      );
      if (result.ok) {
        addFormRef.current?.reset();
        setAdding(false);
      }
    });
  }

  // Preserve the order the server sent (sort_order), grouped by category.
  const categories: { name: string; items: Feature[] }[] = [];
  for (const f of features) {
    const last = categories[categories.length - 1];
    if (last && last.name === f.category) last.items.push(f);
    else categories.push({ name: f.category, items: [f] });
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-title-lg text-on-surface">Users · {users.length}</h1>
        <div className="flex items-center gap-3">
          {message && (
            <p
              role="status"
              className={`font-label-md px-3 py-1.5 rounded-xl ${
                message.kind === "ok"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-error-container text-on-error-container"
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setAdding((v) => !v);
            }}
            className={`${btn} bg-primary text-on-primary hover:shadow-md`}
          >
            <span className="material-symbols-outlined text-lg">
              {adding ? "close" : "person_add"}
            </span>
            {adding ? "Cancel" : "Add user"}
          </button>
        </div>
      </section>

      {adding && (
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 md:p-6">
          {!canCreateUsers && (
            <p className="mb-4 font-body-md text-on-error-container bg-error-container rounded-xl px-4 py-3">
              SUPABASE_SERVICE_ROLE_KEY isn&apos;t configured, so this form
              can&apos;t create accounts yet. Add it to <code>.env.local</code> and
              restart, or create the user in the Supabase dashboard — they&apos;ll
              appear here automatically.
            </p>
          )}
          <form
            ref={addFormRef}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() => createUser(fd), "User created.");
            }}
            className="flex flex-col md:flex-row md:items-end gap-3"
          >
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-sm text-on-surface-variant">Email</span>
              <input name="email" type="email" required className={input} />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-sm text-on-surface-variant">
                Display name
              </span>
              <input name="display_name" type="text" className={input} />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-sm text-on-surface-variant">
                Temporary password
              </span>
              <input
                name="password"
                type="text"
                minLength={10}
                required
                className={input}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className={`${btn} bg-primary text-on-primary`}
            >
              Create
            </button>
          </form>
          <p className="mt-2 font-label-sm text-on-surface-variant">
            Share the password with them directly and ask them to change it. New
            accounts start with no features enabled.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          const isSuper = u.role === "super_admin";
          const open = openId === u.id;

          return (
            <section
              key={u.id}
              className={`bg-surface-container-lowest rounded-2xl border overflow-hidden ${
                u.is_active ? "border-outline-variant/30" : "border-error/40"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setOpenId(open ? null : u.id);
                }}
                className="w-full px-4 md:px-6 py-4 flex items-center gap-3 text-left hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                  {isSuper ? "shield_person" : "person"}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-body-lg text-on-surface truncate">
                    {u.display_name || u.email}
                    {isSelf && (
                      <span className="ml-2 text-xs text-on-surface-variant">(you)</span>
                    )}
                  </span>
                  <span className="block font-label-sm text-on-surface-variant truncate">
                    {u.email}
                  </span>
                </span>

                {isSuper ? (
                  <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide bg-primary text-on-primary px-2 py-0.5 rounded-full">
                    Super admin
                  </span>
                ) : (
                  <span className="hidden sm:inline font-label-sm text-on-surface-variant tabular-nums">
                    {u.features.length}/{features.length} features
                  </span>
                )}
                {!u.is_active && (
                  <span className="text-xs font-semibold uppercase tracking-wide bg-error-container text-on-error-container px-2 py-0.5 rounded-full">
                    Disabled
                  </span>
                )}
                <span className="material-symbols-outlined text-xl text-on-surface-variant">
                  {open ? "expand_less" : "expand_more"}
                </span>
              </button>

              {open && (
                <div className="px-4 md:px-6 pb-5 pt-1 border-t border-outline-variant/20 flex flex-col gap-5">
                  {/* Role + status */}
                  <div className="flex flex-wrap items-end gap-4 pt-4">
                    <label className="flex flex-col gap-1">
                      <span className="font-label-sm text-on-surface-variant">Role</span>
                      <select
                        value={u.role}
                        disabled={isSelf || pending}
                        onChange={(e) => {
                          const next = e.target.value;
                          run(() => setRole(u.id, next), "Role updated.");
                        }}
                        className="rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super admin</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      disabled={isSelf || pending}
                      onClick={() =>
                        run(
                          () => setActive(u.id, !u.is_active),
                          u.is_active ? "User disabled." : "User enabled."
                        )
                      }
                      className={`${btn} border ${
                        u.is_active
                          ? "border-outline-variant/60 text-on-surface-variant hover:border-error hover:text-error"
                          : "border-primary/60 text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {u.is_active ? "block" : "check_circle"}
                      </span>
                      {u.is_active ? "Disable access" : "Enable access"}
                    </button>

                    <button
                      type="button"
                      disabled={isSelf || pending}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Permanently delete ${u.email}? Their entries in the change log are kept.`
                          )
                        )
                          return;
                        run(() => deleteUser(u.id), "User deleted.");
                      }}
                      className={`${btn} text-on-surface-variant hover:bg-error-container hover:text-on-error-container ml-auto`}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                      Delete
                    </button>
                  </div>

                  {/* Feature toggles */}
                  {isSuper ? (
                    <p className="font-body-md text-on-surface-variant bg-surface-container-low rounded-xl px-4 py-3">
                      Super admins have every feature, including user management.
                      Change the role to Admin to control features individually.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {categories.map((cat) => (
                        <div key={cat.name} className="flex flex-col gap-2">
                          <h3 className="font-label-sm uppercase tracking-wide text-on-surface-variant">
                            {cat.name}
                          </h3>
                          {cat.items.map((f) => {
                            const on = u.features.includes(f.key);
                            return (
                              <label
                                key={f.key}
                                className="flex items-center gap-3 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={on}
                                  disabled={pending}
                                  onChange={(e) => {
                                    // Capture now: by the time the transition
                                    // runs, React has reset this controlled input.
                                    const next = e.target.checked;
                                    run(
                                      () => setPermission(u.id, f.key, next),
                                      next ? `Granted ${f.key}.` : `Removed ${f.key}.`
                                    );
                                  }}
                                  className="size-4 accent-primary shrink-0"
                                />
                                <span className="flex-1 min-w-0 font-body-md text-on-surface group-hover:text-primary transition-colors">
                                  {f.label}
                                </span>
                                <code className="font-label-sm text-on-surface-variant/70 hidden lg:inline">
                                  {f.key}
                                </code>
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
