import type { Metadata } from "next";
import { verifySession, type Session } from "@/lib/dal";
import { logout } from "@/app/admin/login/actions";
import AdminNav, { type NavItem } from "@/components/admin/AdminNav";
import ThemeToggle from "@/components/admin/ThemeToggle";

export const metadata: Metadata = {
  title: "Admin | Rio Online School",
  robots: { index: false, follow: false },
};

/** Nav entries, each with the capability that unlocks it. */
const NAV: (NavItem & { allowed: (s: Session) => boolean })[] = [
  {
    href: "/admin",
    label: "Today",
    icon: "today",
    allowed: (s) => s.can("today.view"),
  },
  {
    href: "/admin/timetable",
    label: "Timetable",
    icon: "calendar_month",
    allowed: (s) => s.can("timetable.view") || s.can("timetable.manage"),
  },
  {
    href: "/admin/grades",
    label: "Grades",
    icon: "school",
    allowed: (s) => s.can("grades.manage"),
  },
  {
    href: "/admin/subjects",
    label: "Subjects",
    icon: "menu_book",
    allowed: (s) => s.can("subjects.manage"),
  },
  {
    href: "/admin/snippets",
    label: "Snippets",
    icon: "content_copy",
    allowed: (s) => s.can("snippets.manage"),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: "group",
    allowed: (s) => s.isSuperAdmin,
  },
  {
    href: "/admin/log",
    label: "Log",
    icon: "history",
    allowed: (s) => s.can("audit.view"),
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirects to the login or no-access screen when appropriate.
  const session = await verifySession();

  const items: NavItem[] = NAV.filter((item) => item.allowed(session)).map(
    ({ href, label, icon }) => ({ href, label, icon })
  );

  const name = session.profile.display_name || session.profile.email;

  return (
    <div className="admin-theme min-h-screen flex flex-col bg-surface-container-low text-on-surface">
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-max-width mx-auto px-margin-mobile lg:px-margin-desktop h-16 flex items-center justify-between gap-4">
          <span className="font-title-lg text-primary font-bold tracking-tight whitespace-nowrap">
            Rio Admin
          </span>
          <AdminNav items={items} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logout} className="flex items-center gap-3">
              <span className="hidden md:flex flex-col items-end leading-tight">
                <span className="font-label-sm text-on-surface truncate max-w-48">
                  {name}
                </span>
                {session.isSuperAdmin && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Super admin
                  </span>
                )}
              </span>
              <button
                type="submit"
                className="font-label-md text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile lg:px-margin-desktop py-8">
        {children}
      </main>
    </div>
  );
}
