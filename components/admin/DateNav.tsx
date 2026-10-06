"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addDays, WEEKDAYS, weekdayOf } from "@/lib/date";
import Clock from "./Clock";

const btn =
  "inline-flex items-center gap-1 px-3 py-2 rounded-xl font-label-md border border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors";

/** Small spinner shown inside a <Link> while its navigation is in flight. */
function Pending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
    />
  );
}

export default function DateNav({ date, today }: { date: string; today: string }) {
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const weekday = weekdayOf(date);

  function goTo(value: string) {
    if (!value) return;
    startTransition(() => {
      router.push(value === today ? "/admin" : `/admin?d=${value}`);
    });
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <h1 className="font-headline-md text-on-surface flex items-center gap-2 flex-wrap">
          {WEEKDAYS[weekday]}
          {date === today && (
            <span className="text-xs font-semibold uppercase tracking-wide bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
              Today
            </span>
          )}
          {navigating && (
            <span
              aria-hidden
              className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin"
            />
          )}
        </h1>
        <p className="font-body-md text-on-surface-variant flex items-center gap-3">
          <span className="font-mono">{date}</span>
          <Clock />
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => goTo(e.target.value)}
          aria-label="Jump to date"
          className="rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 font-body-md text-on-surface outline-none focus:border-primary"
        />
        <Link href={`/admin?d=${addDays(date, -1)}`} className={btn}>
          <span className="material-symbols-outlined text-lg">chevron_left</span>
          <span className="hidden sm:inline">Previous</span>
          <Pending />
        </Link>
        <Link href="/admin" className={btn}>
          Today
          <Pending />
        </Link>
        <Link href={`/admin?d=${addDays(date, 1)}`} className={btn}>
          <span className="hidden sm:inline">Next</span>
          <span className="material-symbols-outlined text-lg">chevron_right</span>
          <Pending />
        </Link>
      </div>
    </section>
  );
}
