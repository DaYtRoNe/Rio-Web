export type Section = {
  id: number;
  name: string;
  /** Exact text used as the section heading in the WhatsApp message. */
  heading: string;
  sort_order: number;
};

export type Grade = {
  id: number;
  name: string;
  priority: number;
  section_id: number | null;
};

/**
 * A class recording for one date. Either a scheduled class (grade + subject)
 * or a one-off with a typed title — the database enforces exactly one.
 */
export type Recording = {
  id: number;
  class_date: string;
  grade_id: number | null;
  subject_id: number | null;
  custom_title: string | null;
  section_id: number | null;
  url: string | null;
  is_cancelled: boolean;
};

export type Subject = {
  id: number;
  name: string;
};

export type TimetableEntry = {
  id: number;
  grade_id: number;
  subject_id: number;
  weekday: number;
  grade: Pick<Grade, "name" | "priority">;
  subject: Pick<Subject, "name">;
};

/** Private to `owner_id` — never shared between admins. */
export type Snippet = {
  id: number;
  label: string;
  content: string;
  is_secret: boolean;
  sort_order: number;
};

export type Role = "super_admin" | "admin";

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  role: Role;
  is_active: boolean;
};

/** A grantable capability, from the `feature` catalogue table. */
export type Feature = {
  key: string;
  label: string;
  category: string;
  sort_order: number;
};

export type AuditAction = "insert" | "update" | "delete";

/** One row of the append-only change history. */
export type AuditEntry = {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  entity: string;
  entity_id: string | null;
  label: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
};

/** Standard shape returned by every admin Server Action. */
export type ActionResult = { ok: true } | { ok: false; error: string };
