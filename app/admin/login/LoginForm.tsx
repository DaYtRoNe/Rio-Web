"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-outline-variant/60 bg-surface px-4 py-3 font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-label-md text-on-surface-variant">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-label-md text-on-surface-variant">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-error-container text-on-error-container px-4 py-3 font-body-md"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-on-primary font-label-md py-3.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
