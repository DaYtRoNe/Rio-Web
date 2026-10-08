"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

/**
 * Nav items the signed-in user is allowed to open. The list is built on the
 * server (see the admin layout) so nothing about other people's permissions
 * reaches the browser.
 */
export default function AdminNav({
  items,
  className = "",
}: {
  items: NavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center gap-1 overflow-x-auto ${className}`}>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className={`flex items-center gap-1.5 px-2 xl:px-3 py-2 rounded-xl font-label-md whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="hidden xl:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
