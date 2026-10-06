"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  label?: string;
  className?: string;
};

/** Copies `text` to the clipboard and flashes "Copied" for a moment. */
export default function CopyButton({ text, label = "Copy", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard API needs HTTPS or localhost; fall back to a prompt.
      window.prompt("Copy this text:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-label-md whitespace-nowrap transition-all ${
        copied
          ? "bg-secondary-container text-on-secondary-container"
          : "bg-primary text-on-primary hover:shadow-md"
      } ${className}`}
    >
      <span className="material-symbols-outlined text-lg">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied" : label}
    </button>
  );
}
