import { requireFeature } from "@/lib/dal";
import type { Snippet } from "@/lib/types";
import CrudTable from "@/components/admin/CrudTable";
import { createSnippet, updateSnippet, deleteSnippet } from "./actions";

export default async function SnippetsPage() {
  const { supabase, user } = await requireFeature("snippets.manage");
  const { data, error } = await supabase
    .from("snippet")
    .select("id, label, content, is_secret, sort_order")
    .eq("owner_id", user.id)
    .order("sort_order")
    .order("id")
    .returns<Snippet[]>();

  if (error) throw new Error(error.message);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body-md text-on-surface-variant">
        Saved text you copy often — Drive links, meeting passwords, download
        links. They appear in the Quick copy row on your Today screen. Mark
        passwords as secret so they aren&apos;t shown in this list.
      </p>
      <CrudTable
        title="Your snippets"
        items={data ?? []}
        fields={[
          { name: "label", label: "Label", placeholder: "e.g. Drive folder", width: "w-full md:w-48" },
          { name: "content", label: "Content", placeholder: "https://…", maskWhen: "is_secret" },
          { name: "sort_order", label: "Order", type: "number", width: "w-24" },
          { name: "is_secret", label: "Secret", type: "checkbox", width: "w-20" },
        ]}
        addLabel="Add snippet"
        onCreate={createSnippet}
        onUpdate={updateSnippet}
        onDelete={deleteSnippet}
      />
    </div>
  );
}
