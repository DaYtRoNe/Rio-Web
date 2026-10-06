"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NO_PERMISSION, verifySession } from "@/lib/dal";
import { toActionResult } from "@/lib/db-errors";
import type { ActionResult } from "@/lib/types";

const GradeSchema = z.object({
  name: z.string().trim().min(1, { error: "Please enter a grade name." }).max(80),
  priority: z.coerce
    .number({ error: "Priority must be a number." })
    .int()
    .min(0)
    .max(9999),
});

const uniqueMsg = {
  unique: "That grade name or priority is already in use.",
};

function revalidate() {
  // Grades appear on every admin screen (dashboard, timetable), so bust the whole area.
  revalidatePath("/admin", "layout");
}

export async function createGrade(formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("grades.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = GradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase.from("grade").insert(parsed.data);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

export async function updateGrade(id: number, formData: FormData): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("grades.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const parsed = GradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await supabase.from("grade").update(parsed.data).eq("id", id);
  const result = toActionResult(error, uniqueMsg);
  if (result.ok) revalidate();
  return result;
}

/** Timetable rows referencing this grade are removed by ON DELETE CASCADE. */
export async function deleteGrade(id: number): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can("grades.manage")) return NO_PERMISSION;
  const { supabase } = session;
  const { error } = await supabase.from("grade").delete().eq("id", id);
  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}
