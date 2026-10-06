import { requireFeature } from "@/lib/dal";
import type { Subject } from "@/lib/types";
import CrudTable from "@/components/admin/CrudTable";
import { createSubject, updateSubject, deleteSubject } from "./actions";

export default async function SubjectsPage() {
  const { supabase } = await requireFeature("subjects.manage");
  const { data, error } = await supabase
    .from("subject")
    .select("id, name")
    .order("id")
    .returns<Subject[]>();

  if (error) throw new Error(error.message);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body-md text-on-surface-variant">
        Deleting a subject also removes its timetable entries.
      </p>
      <CrudTable
        title="Subjects"
        items={data ?? []}
        fields={[{ name: "name", label: "Subject name", placeholder: "e.g. ගණිතය" }]}
        addLabel="Add subject"
        deleteWarning="Delete this subject and all of its timetable entries?"
        onCreate={createSubject}
        onUpdate={updateSubject}
        onDelete={deleteSubject}
      />
    </div>
  );
}
