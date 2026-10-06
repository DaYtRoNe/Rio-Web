import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Profile } from "@/lib/types";

/**
 * Data Access Layer.
 *
 * Every admin page and every Server Action starts here. Postgres RLS is the
 * real gate — these checks exist so the app fails with a clear message instead
 * of an empty result set, and so the UI can hide what a user can't use.
 *
 * Memoised with React.cache so one render pass hits Supabase once.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const [profileResult, permissionResult] = await Promise.all([
    supabase
      .from("profile")
      .select("id, email, display_name, role, is_active")
      .eq("id", user.id)
      .maybeSingle<Profile>(),
    supabase.from("permission").select("feature").eq("profile_id", user.id),
  ]);

  const profile = profileResult.data;

  // No profile row, or access switched off by a super admin.
  if (!profile || !profile.is_active) {
    redirect("/admin/no-access?reason=disabled");
  }

  const isSuperAdmin = profile.role === "super_admin";
  const features = new Set<string>(
    (permissionResult.data ?? []).map((row) => row.feature as string)
  );

  return {
    supabase,
    user,
    profile,
    features,
    isSuperAdmin,
    /** Super admins implicitly hold every feature. */
    can: (feature: string) => isSuperAdmin || features.has(feature),
  };
});

export type Session = Awaited<ReturnType<typeof verifySession>>;

/**
 * Page-level guard. Redirects to the no-access screen when the feature is
 * missing, and returns the session so the caller can keep using it.
 */
export async function requireFeature(feature: string): Promise<Session> {
  const session = await verifySession();
  if (!session.can(feature)) {
    redirect(`/admin/no-access?feature=${encodeURIComponent(feature)}`);
  }
  return session;
}

/** Page-level guard for super-admin-only screens (users, etc.). */
export async function requireSuperAdmin(): Promise<Session> {
  const session = await verifySession();
  if (!session.isSuperAdmin) {
    redirect("/admin/no-access?reason=super_admin_only");
  }
  return session;
}

/** Returned by Server Actions when the caller lacks the needed feature. */
export const NO_PERMISSION: ActionResult = {
  ok: false,
  error: "You don't have permission to do this.",
};

/**
 * Where to send someone who can't see the Today screen. Falls through to the
 * first screen they can actually open, so a limited user still lands somewhere
 * useful instead of on an error page.
 */
export function firstAllowedPath(session: Session): string {
  if (session.can("today.view")) return "/admin";
  if (session.can("timetable.view") || session.can("timetable.manage")) {
    return "/admin/timetable";
  }
  if (session.can("grades.manage")) return "/admin/grades";
  if (session.can("subjects.manage")) return "/admin/subjects";
  if (session.can("snippets.manage")) return "/admin/snippets";
  if (session.isSuperAdmin) return "/admin/users";
  if (session.can("audit.view")) return "/admin/log";
  return "/admin/no-access?reason=no_features";
}
