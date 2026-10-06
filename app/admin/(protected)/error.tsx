"use client";

import { useEffect } from "react";

/**
 * Catches render errors in the admin area so a failure shows something
 * readable (and recoverable) instead of a blank screen.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] render error", error);
  }, [error]);

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-error/40 p-6 flex flex-col items-start gap-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-2xl text-error">error</span>
        <h1 className="font-title-lg text-on-surface">Something went wrong</h1>
      </div>
      <p className="font-body-md text-on-surface-variant">
        {error.message || "The page could not be loaded."}
      </p>
      {error.digest && (
        <p className="font-label-sm text-on-surface-variant">
          Reference: <code>{error.digest}</code>
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-label-md bg-primary text-on-primary"
      >
        <span className="material-symbols-outlined text-lg">refresh</span>
        Try again
      </button>
    </section>
  );
}
