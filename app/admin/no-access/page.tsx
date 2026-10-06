import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import ThemeToggle from "@/components/admin/ThemeToggle";

export const metadata: Metadata = {
  title: "No access | Rio Online School",
  robots: { index: false, follow: false },
};

/**
 * Deliberately outside the (protected) group: a signed-in but deactivated user
 * is sent here, and proxy.ts only bounces people away from the login page, so
 * there is no redirect loop.
 */
export default async function NoAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; feature?: string }>;
}) {
  const { reason, feature } = await searchParams;

  const message =
    reason === "disabled"
      ? "Your admin access has been turned off. Ask a super admin to re-enable it."
      : reason === "super_admin_only"
        ? "That area is only available to super admins."
        : reason === "no_features"
          ? "Your account doesn't have any features enabled yet. Ask a super admin to grant you access."
          : feature
            ? `You don't have access to this feature (${feature}). Ask a super admin to grant it.`
            : "You don't have access to that page.";

  return (
    <main className="admin-theme min-h-screen flex items-center justify-center bg-surface-container-low text-on-surface px-margin-mobile relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-112 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-8 flex flex-col items-center gap-4 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">
          lock
        </span>
        <h1 className="font-headline-md text-on-surface">No access</h1>
        <p className="font-body-md text-on-surface-variant">{message}</p>
        <div className="flex items-center gap-2 pt-2">
          {reason !== "disabled" && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl font-label-md border border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary transition-colors"
            >
              Back
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl font-label-md bg-primary text-on-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
