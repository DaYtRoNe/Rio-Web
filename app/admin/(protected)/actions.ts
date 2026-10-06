"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NO_PERMISSION, verifySession } from "@/lib/dal";
import { toActionResult } from "@/lib/db-errors";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import type { ActionResult } from "@/lib/types";

const FEATURE = "recordings.manage";

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Invalid date." });

function revalidate() {
  revalidatePath("/admin");
}

/** Empty string clears the link; anything else must be a usable YouTube URL. */
function parseUrl(raw: string | null | undefined): string | null | undefined {
  if (raw === null || raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return normalizeYouTubeUrl(trimmed) ?? undefined;
}

const ScheduledSchema = z.object({
  classDate: IsoDate,
  gradeId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  url: z.string().max(400).nullable().optional(),
  isCancelled: z.boolean(),
});

/**
 * Creates or updates the recording for a scheduled class. The row only comes
 * into existence once someone sets a link or marks the class as not held.
 */
export async function saveScheduledRecording(input: {
  classDate: string;
  gradeId: number;
  subjectId: number;
  url?: string | null;
  isCancelled: boolean;
}): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can(FEATURE)) return NO_PERMISSION;

  const parsed = ScheduledSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const url = parseUrl(parsed.data.url);
  if (url === undefined && parsed.data.url) {
    return { ok: false, error: "That doesn't look like a YouTube link." };
  }

  const { error } = await session.supabase.from("recording").upsert(
    {
      class_date: parsed.data.classDate,
      grade_id: parsed.data.gradeId,
      subject_id: parsed.data.subjectId,
      url: url ?? null,
      is_cancelled: parsed.data.isCancelled,
      created_by: session.user.id,
    },
    { onConflict: "class_date,grade_id,subject_id" }
  );

  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}

const ExtraSchema = z.object({
  classDate: IsoDate,
  sectionId: z.number().int().positive(),
  gradeId: z.number().int().positive().nullable(),
  subjectId: z.number().int().positive().nullable(),
  customTitle: z.string().trim().min(1).max(200).nullable(),
});

/**
 * Adds a class that isn't on the timetable for this day — either an existing
 * grade + subject, or a one-off typed title.
 */
export async function addExtraRecording(input: {
  classDate: string;
  sectionId: number;
  gradeId: number | null;
  subjectId: number | null;
  customTitle: string | null;
}): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can(FEATURE)) return NO_PERMISSION;

  const parsed = ExtraSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Fill in the class details." };

  const { classDate, sectionId, gradeId, subjectId, customTitle } = parsed.data;

  const isScheduledShape = gradeId !== null && subjectId !== null;
  const isCustomShape = customTitle !== null;

  // Mirrors the database check constraint, with a readable message.
  if (isScheduledShape === isCustomShape) {
    return {
      ok: false,
      error: "Choose a grade and subject, or type a title — not both.",
    };
  }

  const { error } = await session.supabase.from("recording").insert({
    class_date: classDate,
    section_id: sectionId,
    grade_id: gradeId,
    subject_id: subjectId,
    custom_title: customTitle,
    created_by: session.user.id,
  });

  const result = toActionResult(error, {
    unique: "That class is already in the list for this day.",
  });
  if (result.ok) revalidate();
  return result;
}

const UpdateSchema = z.object({
  id: z.number().int().positive(),
  url: z.string().max(400).nullable().optional(),
  isCancelled: z.boolean().optional(),
});

/** Updates an existing recording row by id (used for extras). */
export async function updateRecording(input: {
  id: number;
  url?: string | null;
  isCancelled?: boolean;
}): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can(FEATURE)) return NO_PERMISSION;

  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const patch: Record<string, unknown> = {};

  if (parsed.data.url !== undefined) {
    const url = parseUrl(parsed.data.url);
    if (url === undefined) {
      return { ok: false, error: "That doesn't look like a YouTube link." };
    }
    patch.url = url;
  }
  if (parsed.data.isCancelled !== undefined) {
    patch.is_cancelled = parsed.data.isCancelled;
  }
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await session.supabase
    .from("recording")
    .update(patch)
    .eq("id", parsed.data.id);

  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}

/** Removes an extra class from the day. */
export async function deleteRecording(id: number): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.can(FEATURE)) return NO_PERMISSION;

  const { error } = await session.supabase.from("recording").delete().eq("id", id);
  const result = toActionResult(error);
  if (result.ok) revalidate();
  return result;
}
