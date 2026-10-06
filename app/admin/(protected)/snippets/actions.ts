"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NO_PERMISSION, verifySession } from "@/lib/dal";
import { toActionResult } from "@/lib/db-errors";
import type { ActionResult } from "@/lib/types";

const SnippetSchema = z.object({
  label: z.string().trim().min(1, { error: "Please enter a label." }).max(80),
  content: z.string().trim().min(1, { error: "Please enter the content." }).max(2000),
  // A checkbox is only present in FormData when ticked.
  is_secret: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

const uniqueMsg = { unique: "You already have a snippet with this exact content." };

function revalidate() {
  revalidatePath("/admin", "layout");
}

// Snippets are private: every statement is scoped to the signed-in owner.
// RLS enforces this independently — these filters just make it explicit.

export async function createSnippet(formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("snippets.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = SnippetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("snippet")
    .insert({ ...parsed.data, owner_id: session.user.id });
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

export async function updateSnippet(id: number, formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("snippets.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = SnippetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("snippet")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", session.user.id);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

export async function deleteSnippet(id: number): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("snippets.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const { error } = await supabase
    .from("snippet")
    .delete()
    .eq("id", id)
    .eq("owner_id", session.user.id);
  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}
