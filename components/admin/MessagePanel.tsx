"use client";

import { useEffect, useState } from "react";
import { buildMessage, messageStats, type MessageItem } from "@/lib/message";

/**
 * The finished WhatsApp message. Classes without a link, and ones marked as
 * not held, are left out — the counter above says how many, so nothing is
 * dropped silently.
 */
export default function MessagePanel({
  date,
  items,
}: {
  date: string;
  items: MessageItem[];
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const message = buildMessage(date, items);
  const stats = messageStats(items);
  const nothingToSend = stats.withLink === 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      window.prompt("Copy this message:", message);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
      <div className="px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="font-title-lg text-on-surface">WhatsApp message</h2>
          <p className="font-label-sm text-on-surface-variant">
            {stats.withLink} of {stats.total} link
            {stats.total === 1 ? "" : "s"} added
            {stats.cancelled > 0 && ` · ${stats.cancelled} not held`}
            {stats.missing > 0 && (
              <span className="text-error">
                {" "}
                · {stats.missing} still missing a link
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-label-md border border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {open ? "visibility_off" : "visibility"}
            </span>
            {open ? "Hide" : "Preview"}
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={nothingToSend}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md font-medium transition-colors disabled:opacity-40 ${
              copied
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-primary text-on-primary hover:shadow-md"
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>
      </div>

      {stats.missing > 0 && (
        <p className="px-4 md:px-6 pb-3 font-body-md text-on-surface-variant">
          {stats.missing} class{stats.missing === 1 ? "" : "es"} will be left out.
          Add the link, or mark it as not held, to account for it.
        </p>
      )}

      {open && (
        <pre className="px-4 md:px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 font-mono text-sm text-on-surface whitespace-pre-wrap break-words max-h-[60vh] overflow-auto">
          {nothingToSend ? "Nothing to send yet — no links have been added." : message}
        </pre>
      )}
    </section>
  );
}
