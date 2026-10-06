"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NO_PERMISSION, verifySession } from "@/lib/dal";
import { toActionResult } from "@/lib/db-errors";
import type { ActionResult } from "@/lib/types";

const SubjectSchema = z.object({
  name: z.string().trim().min(1, { error: "Please enter a subject name." }).max(80),
});

const uniqueMsg = { unique: "This subject already exists." };

function revalidate() {
  revalidatePath("/admin", "layout");
}

export async function createSubject(formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("subjects.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = SubjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase.from("subject").insert(parsed.data);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

export async function updateSubject(id: number, formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("subjects.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = SubjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase.from("subject").update(parsed.data).eq("id", id);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

/** Timetable rows referencing this subject are removed by ON DELETE CASCADE. */
export async function deleteSubject(id: number): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("subjects.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const { error } = await supabase.from("subject").delete().eq("id", id);
  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}
