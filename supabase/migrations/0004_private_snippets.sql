-- Snippets become private to the person who created them.
-- Nobody else can read or change them — not even a super admin — because they
-- hold things like meeting passwords.
-- Requires 0003_rbac.sql.

-- ===========================================================================
-- 1. Ownership
-- ===========================================================================

alter table public.snippet
  add column owner_id uuid references public.profile(id) on delete cascade;

-- Everything that exists today was created by / for the first super admin.
update public.snippet
set owner_id = (
  select id from public.profile
  where role = 'super_admin'
  order by created_at
  limit 1
)
where owner_id is null;

alter table public.snippet alter column owner_id set not null;

-- New rows get the caller automatically; the RLS check below also enforces it.
alter table public.snippet alter column owner_id set default auth.uid();

create index snippet_owner_idx on public.snippet (owner_id);

-- ===========================================================================
-- 2. Uniqueness is now per person
--
-- Two people may legitimately save the same link, so the global unique
-- constraint on `content` becomes unique per owner. The constraint name is
-- looked up rather than assumed.
-- ===========================================================================

do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  where con.conrelid = 'public.snippet'::regclass
    and con.contype = 'u'
    and array_length(con.conkey, 1) = 1
    and con.conkey[1] = (
      select att.attnum
      from pg_attribute att
      where att.attrelid = 'public.snippet'::regclass
        and att.attname = 'content'
    );

  if constraint_name is not null then
    execute format('alter table public.snippet drop constraint %I', constraint_name);
  end if;
end
$$;

alter table public.snippet
  add constraint snippet_owner_content_key unique (owner_id, content);

-- ===========================================================================
-- 3. Row Level Security — owner only
-- ===========================================================================

drop policy if exists "read snippets" on public.snippet;
drop policy if exists "manage snippets" on public.snippet;

create policy "read own snippets" on public.snippet
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    and (select public.has_feature('snippets.use'))
  );

create policy "manage own snippets" on public.snippet
  for all to authenticated
  using (
    owner_id = (select auth.uid())
    and (select public.has_feature('snippets.manage'))
  )
  with check (
    owner_id = (select auth.uid())
    and (select public.has_feature('snippets.manage'))
  );

-- ===========================================================================
-- 4. Keep snippet contents out of the audit log
--
-- The log records before/after row data, and anyone with audit.view can read
-- it. Snippet content is private, so it is stripped — the label and the fact
-- that a change happened are still recorded.
-- ===========================================================================

create or replace function public.log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor  uuid := auth.uid();
  v_email  text;
  v_row    jsonb;
  v_id     text;
  v_label  text;
  v_before jsonb;
  v_after  jsonb;
  v_days   text[] := array['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
begin
  select email into v_email from public.profile where id = v_actor;

  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_id  := v_row->>'id';

  if tg_table_name = 'timetable' then
    select
      coalesce(g.name, 'grade #' || (v_row->>'grade_id'))
      || ' — ' || coalesce(s.name, 'subject #' || (v_row->>'subject_id'))
      || ' (' || v_days[(v_row->>'weekday')::int + 1] || ')'
    into v_label
    from (select 1) _
    left join public.grade   g on g.id = (v_row->>'grade_id')::int
    left join public.subject s on s.id = (v_row->>'subject_id')::int;

  elsif tg_table_name in ('grade', 'subject') then
    v_label := v_row->>'name';

  elsif tg_table_name = 'snippet' then
    v_label := v_row->>'label';

  elsif tg_table_name = 'profile' then
    v_label := v_row->>'email';

  elsif tg_table_name = 'permission' then
    v_id := (v_row->>'profile_id') || ':' || (v_row->>'feature');
    select coalesce(p.email, v_row->>'profile_id') || ' → ' || (v_row->>'feature')
    into v_label
    from (select 1) _
    left join public.profile p on p.id = (v_row->>'profile_id')::uuid;

  else
    v_label := v_id;
  end if;

  v_before := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_after  := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;

  -- Private data never enters the log.
  if tg_table_name = 'snippet' then
    v_before := v_before - 'content';
    v_after  := v_after  - 'content';
  end if;

  insert into public.audit_log (
    actor_id, actor_email, action, entity, entity_id, label, before, after
  )
  values (
    v_actor, v_email, lower(tg_op), tg_table_name, v_id, v_label, v_before, v_after
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- The revoke from 0003's hardening step applies to the replaced function too.
revoke execute on function public.log_change() from public, anon, authenticated;

-- ===========================================================================
-- 5. Feature labels now say "your"
-- ===========================================================================

update public.feature
set label = 'Use your own quick-copy snippets'
where key = 'snippets.use';

update public.feature
set label = 'Create and edit your own snippets'
where key = 'snippets.manage';
