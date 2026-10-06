-- Rio Online School — multi-admin roles, per-feature permissions, audit log.
-- Requires 0001_schema.sql and 0002_seed.sql to have been applied first.

-- ===========================================================================
-- 1. Tables
-- ===========================================================================

-- One row per admin user, mirroring auth.users.
create table public.profile (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  role         text not null default 'admin' check (role in ('super_admin', 'admin')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- The capabilities that can be granted. Seeded here so the admin UI can list
-- them; a foreign key stops typos from creating phantom permissions.
create table public.feature (
  key        text primary key,
  label      text not null,
  category   text not null,
  sort_order integer not null default 0
);

insert into public.feature (key, label, category, sort_order) values
  ('today.view',       'See the day''s class list',              'Today',          1),
  ('today.copy',       'Copy class titles (YouTube workflow)',   'Today',          2),
  ('snippets.use',     'Use quick-copy snippets',                'Today',          3),
  ('timetable.view',   'View the timetable',                     'Timetable',      4),
  ('timetable.manage', 'Add, edit and delete classes',           'Timetable',      5),
  ('grades.manage',    'Manage grades',                          'Reference data', 6),
  ('subjects.manage',  'Manage subjects',                        'Reference data', 7),
  ('snippets.manage',  'Manage snippets',                        'Reference data', 8),
  ('content.manage',   'Edit public website content',            'Website',        9),
  ('audit.view',       'View the change log',                    'Audit',         10);

-- Presence of a row means the feature is granted. Super admins bypass this.
create table public.permission (
  profile_id uuid not null references public.profile(id) on delete cascade,
  feature    text not null references public.feature(key) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (profile_id, feature)
);

-- Append-only history of every data change. Written by triggers, never by the
-- application, so changes made outside the app are recorded too.
create table public.audit_log (
  id          bigserial primary key,
  actor_id    uuid,
  actor_email text,           -- snapshot: survives the user being deleted
  action      text not null check (action in ('insert', 'update', 'delete')),
  entity      text not null,
  entity_id   text,
  label       text,           -- human-readable, resolved at write time
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_entity_idx     on public.audit_log (entity, created_at desc);
create index audit_log_actor_idx      on public.audit_log (actor_id, created_at desc);

-- ===========================================================================
-- 2. Authorization helpers
--
-- SECURITY DEFINER so they can read profile/permission without triggering the
-- policies that call them (which would recurse). STABLE so Postgres evaluates
-- them once per statement when policies wrap them in (select ...).
-- ===========================================================================

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile
    where id = auth.uid() and is_active
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile
    where id = auth.uid() and is_active and role = 'super_admin'
  );
$$;

create or replace function public.has_feature(f text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile p
    where p.id = auth.uid()
      and p.is_active
      and (
        p.role = 'super_admin'
        or exists (
          select 1 from public.permission pm
          where pm.profile_id = p.id and pm.feature = f
        )
      )
  );
$$;

-- ===========================================================================
-- 3. Profile provisioning
-- ===========================================================================

-- Every new auth user gets a profile. The very first one becomes super admin;
-- everyone after starts with no features until a super admin grants them.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.profile) into is_first;

  insert into public.profile (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    case when is_first then 'super_admin' else 'admin' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who already exists; the earliest account becomes super admin.
insert into public.profile (id, email, display_name, role, created_at)
select
  u.id,
  u.email,
  split_part(u.email, '@', 1),
  case
    when u.created_at = (select min(created_at) from auth.users) then 'super_admin'
    else 'admin'
  end,
  u.created_at
from auth.users u
on conflict (id) do nothing;

-- ===========================================================================
-- 4. Audit triggers
-- ===========================================================================

create or replace function public.log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_row   jsonb;
  v_id    text;
  v_label text;
  v_days  text[] := array['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
begin
  select email into v_email from public.profile where id = v_actor;

  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_id  := v_row->>'id';

  -- A readable label, resolved now so it stays correct after related rows go.
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

  insert into public.audit_log (
    actor_id, actor_email, action, entity, entity_id, label, before, after
  )
  values (
    v_actor,
    v_email,
    lower(tg_op),
    tg_table_name,
    v_id,
    v_label,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger audit_grade      after insert or update or delete on public.grade      for each row execute function public.log_change();
create trigger audit_subject    after insert or update or delete on public.subject    for each row execute function public.log_change();
create trigger audit_timetable  after insert or update or delete on public.timetable  for each row execute function public.log_change();
create trigger audit_snippet    after insert or update or delete on public.snippet    for each row execute function public.log_change();
create trigger audit_profile    after insert or update or delete on public.profile    for each row execute function public.log_change();
create trigger audit_permission after insert or update or delete on public.permission for each row execute function public.log_change();

-- ===========================================================================
-- 5. Row Level Security
-- ===========================================================================

alter table public.profile    enable row level security;
alter table public.feature    enable row level security;
alter table public.permission enable row level security;
alter table public.audit_log  enable row level security;

-- Profiles: any active admin can read (names are shown in the log and UI);
-- only a super admin can create, change or deactivate.
create policy "read profiles" on public.profile
  for select to authenticated
  using ((select public.is_active_admin()));

create policy "super admin manages profiles" on public.profile
  for all to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

-- Feature catalogue: readable by any active admin, changed only by migrations.
create policy "read features" on public.feature
  for select to authenticated
  using ((select public.is_active_admin()));

-- Permissions: you can see your own; super admins see and change all.
create policy "read permissions" on public.permission
  for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_super_admin()));

create policy "super admin manages permissions" on public.permission
  for all to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

-- Audit log: readable with audit.view. No insert/update/delete policy exists,
-- so nobody can write or rewrite history — only the SECURITY DEFINER trigger.
create policy "read audit log" on public.audit_log
  for select to authenticated
  using ((select public.has_feature('audit.view')));

-- --- Replace the blanket policies from 0001 with feature-based ones ---------

drop policy if exists "admin full access" on public.grade;
drop policy if exists "admin full access" on public.subject;
drop policy if exists "admin full access" on public.timetable;
drop policy if exists "admin full access" on public.snippet;

-- Grades and subjects are joined by nearly every screen and are not sensitive,
-- so any active admin may read them; editing is gated.
create policy "read grades" on public.grade
  for select to authenticated
  using ((select public.is_active_admin()));

create policy "manage grades" on public.grade
  for all to authenticated
  using ((select public.has_feature('grades.manage')))
  with check ((select public.has_feature('grades.manage')));

create policy "read subjects" on public.subject
  for select to authenticated
  using ((select public.is_active_admin()));

create policy "manage subjects" on public.subject
  for all to authenticated
  using ((select public.has_feature('subjects.manage')))
  with check ((select public.has_feature('subjects.manage')));

create policy "read timetable" on public.timetable
  for select to authenticated
  using (
    (select public.has_feature('today.view'))
    or (select public.has_feature('timetable.view'))
  );

create policy "manage timetable" on public.timetable
  for all to authenticated
  using ((select public.has_feature('timetable.manage')))
  with check ((select public.has_feature('timetable.manage')));

create policy "read snippets" on public.snippet
  for select to authenticated
  using ((select public.has_feature('snippets.use')));

create policy "manage snippets" on public.snippet
  for all to authenticated
  using ((select public.has_feature('snippets.manage')))
  with check ((select public.has_feature('snippets.manage')));
