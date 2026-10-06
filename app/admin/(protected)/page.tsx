import { redirect } from "next/navigation";
import { firstAllowedPath, verifySession } from "@/lib/dal";
import { parseIsoDate, todayIso, weekdayOf } from "@/lib/date";
import type {
  Grade,
  Recording,
  Section,
  Snippet,
  Subject,
  TimetableEntry,
} from "@/lib/types";
import DateNav from "@/components/admin/DateNav";
import SnippetChips from "@/components/admin/SnippetChips";
import TodayBoard, { type ClassRow } from "@/components/admin/TodayBoard";

type Props = { searchParams: Promise<{ d?: string }> };

/** Timetable rows carry the grade's section so the day can be grouped. */
type TimetableRow = TimetableEntry & {
  grade: TimetableEntry["grade"] & { id: number; section_id: number | null };
  subject: TimetableEntry["subject"] & { id: number };
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await verifySession();

  if (!session.can("today.view")) {
    redirect(firstAllowedPath(session));
  }

  const { supabase } = session;
  const canCopy = session.can("today.copy");
  const canRecord = session.can("recordings.manage");
  const canUseSnippets = session.can("snippets.use");

  const { d } = await searchParams;
  const date = parseIsoDate(d);
  const today = todayIso();
  const weekday = weekdayOf(date);

  const [timetable, recordings, sections, snippetResult, grades, subjects] =
    await Promise.all([
      supabase
        .from("timetable")
        .select(
          "id, grade_id, subject_id, weekday, grade(id, name, priority, section_id), subject(id, name)"
        )
        .eq("weekday", weekday)
        .returns<TimetableRow[]>(),
      supabase
        .from("recording")
        .select(
          "id, class_date, grade_id, subject_id, custom_title, section_id, url, is_cancelled"
        )
        .eq("class_date", date)
        .returns<Recording[]>(),
      supabase
        .from("section")
        .select("id, name, heading, sort_order")
        .order("sort_order")
        .returns<Section[]>(),
      canUseSnippets
        ? supabase
            .from("snippet")
            .select("id, label, content, is_secret, sort_order")
            .eq("owner_id", session.user.id)
            .order("sort_order")
            .order("id")
            .returns<Snippet[]>()
        : Promise.resolve({ data: [] as Snippet[] }),
      canRecord
        ? supabase
            .from("grade")
            .select("id, name, priority, section_id")
            .order("priority")
            .returns<Grade[]>()
        : Promise.resolve({ data: [] as Grade[] }),
      canRecord
        ? supabase
            .from("subject")
            .select("id, name")
            .order("name")
            .returns<Subject[]>()
        : Promise.resolve({ data: [] as Subject[] }),
    ]);

  const firstError = timetable.error ?? recordings.error ?? sections.error;
  if (firstError) throw new Error(firstError.message);

  const sectionList = sections.data ?? [];
  const sectionById = new Map(sectionList.map((s) => [s.id, s]));
  const fallbackSection = sectionList[0];

  // Index recordings by the class they belong to so scheduled rows can find them.
  const byClass = new Map<string, Recording>();
  const extras: Recording[] = [];
  for (const rec of recordings.data ?? []) {
    if (rec.grade_id !== null && rec.subject_id !== null) {
      byClass.set(`${rec.grade_id}:${rec.subject_id}`, rec);
    } else {
      extras.push(rec);
    }
  }

  const rows: ClassRow[] = [];

  for (const entry of timetable.data ?? []) {
    const key = `${entry.grade_id}:${entry.subject_id}`;
    const rec = byClass.get(key);
    const section = entry.grade.section_id
      ? sectionById.get(entry.grade.section_id)
      : undefined;

    rows.push({
      key: `t${entry.id}`,
      recordingId: rec?.id ?? null,
      gradeId: entry.grade_id,
      subjectId: entry.subject_id,
      grade: entry.grade.name,
      subject: entry.subject.name,
      customTitle: null,
      sectionId: section?.id ?? null,
      sectionName: section?.name ?? "Ungrouped",
      sectionHeading: section?.heading ?? "",
      sectionOrder: section?.sort_order ?? 999,
      priority: entry.grade.priority,
      url: rec?.url ?? null,
      isCancelled: rec?.is_cancelled ?? false,
      isExtra: false,
    });
    byClass.delete(key);
  }

  // Recordings for grade/subject pairs that aren't on this weekday's timetable.
  const gradeById = new Map((grades.data ?? []).map((g) => [g.id, g]));
  const subjectById = new Map((subjects.data ?? []).map((s) => [s.id, s]));

  for (const rec of byClass.values()) {
    const grade = rec.grade_id ? gradeById.get(rec.grade_id) : undefined;
    const subject = rec.subject_id ? subjectById.get(rec.subject_id) : undefined;
    const section =
      (rec.section_id ? sectionById.get(rec.section_id) : undefined) ??
      (grade?.section_id ? sectionById.get(grade.section_id) : undefined);

    rows.push({
      key: `r${rec.id}`,
      recordingId: rec.id,
      gradeId: rec.grade_id,
      subjectId: rec.subject_id,
      grade: grade?.name ?? "Unknown grade",
      subject: subject?.name ?? "Unknown subject",
      customTitle: null,
      sectionId: section?.id ?? null,
      sectionName: section?.name ?? "Ungrouped",
      sectionHeading: section?.heading ?? "",
      sectionOrder: section?.sort_order ?? 999,
      priority: grade?.priority ?? 9999,
      url: rec.url,
      isCancelled: rec.is_cancelled,
      isExtra: true,
    });
  }

  for (const rec of extras) {
    const section = rec.section_id ? sectionById.get(rec.section_id) : undefined;
    rows.push({
      key: `r${rec.id}`,
      recordingId: rec.id,
      gradeId: null,
      subjectId: null,
      grade: "",
      subject: rec.custom_title ?? "",
      customTitle: rec.custom_title,
      sectionId: section?.id ?? null,
      sectionName: section?.name ?? "Ungrouped",
      sectionHeading: section?.heading ?? "",
      sectionOrder: section?.sort_order ?? 999,
      // One-offs sit at the end of their section.
      priority: 99999,
      url: rec.url,
      isCancelled: rec.is_cancelled,
      isExtra: true,
    });
  }

  rows.sort(
    (a, b) =>
      a.sectionOrder - b.sectionOrder ||
      a.priority - b.priority ||
      a.subject.localeCompare(b.subject, "si")
  );

  const snippets = snippetResult.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <DateNav date={date} today={today} />
      {snippets.length > 0 && <SnippetChips snippets={snippets} />}
      {/* key: remount on date change so local state resets cleanly */}
      <TodayBoard
        key={date}
        rows={rows}
        date={date}
        weekday={weekday}
        canCopy={canCopy}
        canRecord={canRecord}
        sections={sectionList}
        grades={grades.data ?? []}
        subjects={subjects.data ?? []}
        defaultSectionId={fallbackSection?.id ?? null}
      />
    </div>
  );
}
