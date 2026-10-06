"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NO_PERMISSION, verifySession } from "@/lib/dal";
import { toActionResult } from "@/lib/db-errors";
import type { ActionResult } from "@/lib/types";

const EntrySchema = z.object({
  grade_id: z.coerce.number({ error: "Please select a grade." }).int().positive({ error: "Please select a grade." }),
  subject_id: z.coerce.number({ error: "Please select a subject." }).int().positive({ error: "Please select a subject." }),
  weekday: z.coerce.number().int().min(0).max(6),
});

const uniqueMsg = { unique: "This grade already has that subject on this day." };

function revalidate() {
  revalidatePath("/admin", "layout");
}

export async function createEntry(formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("timetable.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = EntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase.from("timetable").insert(parsed.data);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

/** Like the desktop app, editing changes grade/subject but keeps the day. */
export async function updateEntry(id: number, formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("timetable.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = EntrySchema.omit({ weekday: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase.from("timetable").update(parsed.data).eq("id", id);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

export async function deleteEntry(id: number): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("timetable.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const { error } = await supabase.from("timetable").delete().eq("id", id);
  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}
