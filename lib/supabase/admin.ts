import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. This key bypasses Row Level Security entirely,
 * so it is used for exactly one thing: creating and deleting Auth users, which
 * the anon key cannot do.
 *
 * Never import this from a Client Component, never use it for ordinary data
 * access, and always re-check that the caller is a super admin first. The
 * `server-only` import above makes a client-side import a build error.
 *
 * Returns null when the key isn't configured, so the UI can say so instead of
 * crashing.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
