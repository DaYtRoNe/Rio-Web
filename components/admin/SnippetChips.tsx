"use client";

import { useEffect, useState } from "react";
import type { Snippet } from "@/lib/types";

/**
 * One-click copy chips. Replaces the desktop app's "select from a dropdown,
 * then press Copy" two-step — each chip copies its own content directly.
 *
 * Snippets are private to their owner, so this only ever shows your own.
 */
export default function SnippetChips({ snippets }: { snippets: Snippet[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (copiedId === null) return;
    const t = setTimeout(() => setCopiedId(null), 1500);
    return () => clearTimeout(t);
  }, [copiedId]);

  async function copy(snippet: Snippet) {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopiedId(snippet.id);
    } catch {
      window.prompt("Copy this text:", snippet.content);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 md:px-6 flex flex-wrap items-center gap-2">
      <span
        className="font-label-md text-on-surface-variant mr-1 inline-flex items-center gap-1"
        title="Only you can see your snippets"
      >
        <span className="material-symbols-outlined text-base">lock</span>
        Quick copy
      </span>
      {snippets.map((s) => {
        const copied = copiedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => copy(s)}
            title={s.is_secret ? "Hidden value" : s.content}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-label-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              copied
                ? "bg-secondary-container text-on-secondary-container border-transparent"
                : "border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {copied ? "check" : s.is_secret ? "lock" : "content_copy"}
            </span>
            {copied ? "Copied" : s.label}
          </button>
        );
      })}
    </section>
  );
}
