"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { toActionResult } from "@/lib/db-errors";
import type { ActionResult } from "@/lib/types";

const DENIED: ActionResult = {
  ok: false,
  error: "Only a super admin can manage users.",
};

const SELF: ActionResult = {
  ok: false,
  error: "You can't change your own role or access.",
};

/**
 * Every action here re-checks super admin on the server. RLS enforces the same
 * rule at the database level — this exists to return a readable message.
 */
async function requireSuper() {
  const session = await verifySession();
  return session.isSuperAdmin ? session : null;
}

function revalidate() {
  revalidatePath("/admin/users");
}

export async function setPermission(
  profileId: string,
  feature: string,
  granted: boolean
): Promise<ActionResult> {
  const session = await requireSuper();
  if (!session) return DENIED;
  // Changing your own permissions is pointless (super admins hold everything)
  // and could only ever lock you out.
  if (profileId === session.user.id) return SELF;

  const { error } = granted
    ? await session.supabase
        .from("permission")
        .insert({ profile_id: profileId, feature })
    : await session.supabase
        .from("permission")
        .delete()
        .eq("profile_id", profileId)
        .eq("feature", feature);

  // Granting something already granted is not an error worth surfacing.
  if (error?.code === "23505") return { ok: true };

  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}

const RoleSchema = z.enum(["super_admin", "admin"]);

export async function setRole(
  profileId: string,
  role: string
): Promise<ActionResult> {
  const session = await requireSuper();
  if (!session) return DENIED;
  if (profileId === session.user.id) return SELF;

  const parsed = RoleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: "Unknown role." };

  const { error } = await session.supabase
    .from("profile")
    .update({ role: parsed.data })
    .eq("id", profileId);

  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}

export async function setActive(
  profileId: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await requireSuper();
  if (!session) return DENIED;
  if (profileId === session.user.id) return SELF;

  const { error } = await session.supabase
    .from("profile")
    .update({ is_active: isActive })
    .eq("id", profileId);

  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}

const NewUserSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  display_name: z.string().trim().max(80).optional(),
  password: z
    .string()
    .min(10, { error: "Password must be at least 10 characters." })
    .max(100),
});

/** Creates the Auth user; the DB trigger creates the matching profile row. */
export async function createUser(formData: FormData): Promise<ActionResult> {
  const session = await requireSuper();
  if (!session) return DENIED;

  const parsed = NewUserSchema.safeParse({
    email: formData.get("email"),
    display_name: formData.get("display_name") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not set, so new users can't be created here. Add it to .env.local, or create the account in the Supabase dashboard.",
    };
  }

  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: parsed.data.display_name
      ? { display_name: parsed.data.display_name }
      : undefined,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message.toLowerCase().includes("already")
          ? "A user with that email already exists."
          : error.message,
    };
  }

  revalidate();
  return { ok: true };
}

/**
 * Permanently removes the Auth user. The profile and its permissions go with it
 * via ON DELETE CASCADE; audit log entries survive, since actor_email is stored
 * as a snapshot rather than a foreign key.
 */
export async function deleteUser(profileId: string): Promise<ActionResult> {
  const session = await requireSuper();
  if (!session) return DENIED;
  if (profileId === session.user.id) {
    return { ok: false, error: "You can't delete your own account." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not set. Deactivate the user instead, or delete them in the Supabase dashboard.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) return { ok: false, error: error.message };

  revalidate();
  return { ok: true };
}
