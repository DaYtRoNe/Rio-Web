import { requireSuperAdmin } from "@/lib/dal";
import type { Feature, Profile } from "@/lib/types";
import UserManager, { type UserRow } from "@/components/admin/UserManager";

export default async function UsersPage() {
  const { supabase, user } = await requireSuperAdmin();

  const [profiles, features, permissions] = await Promise.all([
    supabase
      .from("profile")
      .select("id, email, display_name, role, is_active")
      .order("created_at")
      .returns<Profile[]>(),
    supabase
      .from("feature")
      .select("key, label, category, sort_order")
      .order("sort_order")
      .returns<Feature[]>(),
    supabase.from("permission").select("profile_id, feature"),
  ]);

  const firstError = profiles.error ?? features.error ?? permissions.error;
  if (firstError) throw new Error(firstError.message);

  const granted = new Map<string, string[]>();
  for (const row of permissions.data ?? []) {
    const list = granted.get(row.profile_id) ?? [];
    list.push(row.feature);
    granted.set(row.profile_id, list);
  }

  const users: UserRow[] = (profiles.data ?? []).map((p) => ({
    ...p,
    features: granted.get(p.id) ?? [],
  }));

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body-md text-on-surface-variant">
        Super admins hold every feature automatically. For everyone else, turn on
        only what they need — new accounts start with nothing enabled.
      </p>
      <UserManager
        users={users}
        features={features.data ?? []}
        currentUserId={user.id}
        canCreateUsers={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}
      />
    </div>
  );
}
