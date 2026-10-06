import type { PostgrestError } from "@supabase/supabase-js";
import type { ActionResult } from "@/lib/types";

/**
 * Maps a Supabase/Postgres error to the message shown in the admin UI.
 * Uniqueness is enforced by the DB now, so 23505 replaces the old
 * "check if it already exists" queries from the desktop app.
 */
export function toActionResult(
  error: PostgrestError | null,
  messages: { unique?: string } = {}
): ActionResult {
  if (!error) return { ok: true };

  if (error.code === "23505") {
    return { ok: false, error: messages.unique ?? "This entry already exists." };
  }
  if (error.code === "23514") {
    return { ok: false, error: "Invalid value." };
  }
  if (error.code === "42501") {
    return { ok: false, error: "Not allowed. Please sign in again." };
  }

  console.error("[admin] database error", error);
  return { ok: false, error: "Something went wrong. Please try again." };
}
