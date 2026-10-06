import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { todayIso, weekdayOf } from "@/lib/date";
import type { Grade, Subject, TimetableEntry } from "@/lib/types";
import TimetableManager from "@/components/admin/TimetableManager";

type Props = { searchParams: Promise<{ day?: string }> };

export default async function TimetablePage({ searchParams }: Props) {
  const session = await verifySession();
  // Either capability is enough to look at the timetable.
  if (!session.can("timetable.view") && !session.can("timetable.manage")) {
    redirect("/admin/no-access?feature=timetable.view");
  }
  const { supabase } = session;
  const { day } = await searchParams;

  const parsedDay = Number(day);
  const weekday =
    Number.isInteger(parsedDay) && parsedDay >= 0 && parsedDay <= 6
      ? parsedDay
      : weekdayOf(todayIso());

  const [entries, grades, subjects] = await Promise.all([
    supabase
      .from("timetable")
      .select("id, grade_id, subject_id, weekday, grade(name, priority), subject(name)")
      .eq("weekday", weekday)
      .returns<TimetableEntry[]>(),
    supabase.from("grade").select("id, name, priority").order("priority").returns<Grade[]>(),
    supabase.from("subject").select("id, name").order("name").returns<Subject[]>(),
  ]);

  const firstError = entries.error ?? grades.error ?? subjects.error;
  if (firstError) throw new Error(firstError.message);

  const sorted = (entries.data ?? []).sort(
    (a, b) =>
      a.grade.priority - b.grade.priority ||
      a.subject.name.localeCompare(b.subject.name, "si")
  );

  return (
    <TimetableManager
      weekday={weekday}
      entries={sorted}
      grades={grades.data ?? []}
      subjects={subjects.data ?? []}
      canManage={session.can("timetable.manage")}
    />
  );
}
