import { requireFeature } from "@/lib/dal";
import type { Grade } from "@/lib/types";
import CrudTable from "@/components/admin/CrudTable";
import { createGrade, updateGrade, deleteGrade } from "./actions";

export default async function GradesPage() {
  const { supabase } = await requireFeature("grades.manage");
  const { data, error } = await supabase
    .from("grade")
    .select("id, name, priority")
    .order("priority")
    .returns<Grade[]>();

  if (error) throw new Error(error.message);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body-md text-on-surface-variant">
        Priority controls the order grades appear in on the Today screen (lower
        first). Deleting a grade also removes its timetable entries.
      </p>
      <CrudTable
        title="Grades"
        items={data ?? []}
        fields={[
          { name: "name", label: "Grade name", placeholder: "e.g. 6 ශ්‍රේණිය" },
          { name: "priority", label: "Priority", type: "number", width: "w-28" },
        ]}
        addLabel="Add grade"
        deleteWarning="Delete this grade and all of its timetable entries?"
        onCreate={createGrade}
        onUpdate={updateGrade}
        onDelete={deleteGrade}
      />
    </div>
  );
}
