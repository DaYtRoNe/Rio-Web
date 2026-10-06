import { requireFeature } from "@/lib/dal";
import type { AuditEntry, Profile } from "@/lib/types";
import LogFilters from "@/components/admin/LogFilters";
import LogList from "@/components/admin/LogList";

const PAGE_SIZE = 50;

type Props = {
  searchParams: Promise<{
    entity?: string;
    actor?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

const ENTITIES = ["timetable", "grade", "subject", "snippet", "profile", "permission"];
const ACTIONS = ["insert", "update", "delete"];

export default async function LogPage({ searchParams }: Props) {
  const { supabase } = await requireFeature("audit.view");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("audit_log")
    .select(
      "id, actor_id, actor_email, action, entity, entity_id, label, before, after, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Only apply filters we recognise, so a hand-edited URL can't break the query.
  if (params.entity && ENTITIES.includes(params.entity)) {
    query = query.eq("entity", params.entity);
  }
  if (params.action && ACTIONS.includes(params.action)) {
    query = query.eq("action", params.action);
  }
  if (params.actor) {
    query = query.eq("actor_id", params.actor);
  }
  if (params.from && /^\d{4}-\d{2}-\d{2}$/.test(params.from)) {
    query = query.gte("created_at", `${params.from}T00:00:00Z`);
  }
  if (params.to && /^\d{4}-\d{2}-\d{2}$/.test(params.to)) {
    query = query.lte("created_at", `${params.to}T23:59:59Z`);
  }

  const [{ data, error, count }, people] = await Promise.all([
    query.returns<AuditEntry[]>(),
    supabase
      .from("profile")
      .select("id, email, display_name, role, is_active")
      .order("email")
      .returns<Profile[]>(),
  ]);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-title-lg text-on-surface">Change log</h1>
        <p className="font-body-md text-on-surface-variant">
          Every change to grades, subjects, the timetable, snippets, users and
          permissions — recorded by the database itself, so changes made outside
          this app appear here too. Nothing in this log can be edited or deleted.
        </p>
      </div>

      <LogFilters people={people.data ?? []} entities={ENTITIES} actions={ACTIONS} />

      <LogList
        entries={data ?? []}
        page={page}
        lastPage={lastPage}
        total={total}
      />
    </div>
  );
}
