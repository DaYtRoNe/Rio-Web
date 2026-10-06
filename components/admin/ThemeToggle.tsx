"use client";

import { THEME_STORAGE_KEY } from "./ThemeScript";

/**
 * Light/dark switch for the admin area.
 *
 * Which icon shows is decided in CSS from `html[data-theme]`, not React state —
 * that keeps the button correct on the very first paint (ThemeScript sets the
 * attribute before hydration) with no flash and no SSR mismatch.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / blocked storage: theme still applies for this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={`inline-flex items-center justify-center size-10 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-xl theme-icon-moon">dark_mode</span>
      <span className="material-symbols-outlined text-xl theme-icon-sun">light_mode</span>
    </button>
  );
}
