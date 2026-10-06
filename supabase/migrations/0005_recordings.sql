-- Daily recording links and the sections used to group them in the WhatsApp
-- message. Requires 0004_private_snippets.sql.

-- ===========================================================================
-- 1. Sections
--
-- The grade `priority` values already encoded these groups informally
-- (1-9 = primary, 50-55 = Sinhala medium, 75-80 = English medium). This makes
-- the grouping explicit and lets the heading text be edited.
-- ===========================================================================

create table public.section (
  id         serial primary key,
  name       text not null unique check (length(trim(name)) > 0),
  heading    text not null check (length(trim(heading)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.section (name, heading, sort_order) values
  ('Grade 1-5',      '1-5🔻', 1),
  ('Sinhala Medium', 'SM🔻',  2),
  ('English Medium', 'EM🔻',  3);

alter table public.grade
  add column section_id integer references public.section(id) on delete set null;

update public.grade
set section_id = (select id from public.section where name = 'Grade 1-5')
where priority < 50;

update public.grade
set section_id = (select id from public.section where name = 'Sinhala Medium')
where priority >= 50 and priority < 75;

update public.grade
set section_id = (select id from public.section where name = 'English Medium')
where priority >= 75;

create index grade_section_idx on public.grade (section_id);

-- ===========================================================================
-- 2. Recordings
--
-- One row per class per day, created when someone first touches that class.
-- Shared between admins so whoever uploads can fill in the link.
--
-- A row is either a scheduled class (grade + subject) or a one-off with a
-- typed title — never both, never neither.
-- ===========================================================================

create table public.recording (
  id           bigserial primary key,
  class_date   date not null,
  grade_id     integer references public.grade(id)   on delete cascade,
  subject_id   integer references public.subject(id) on delete cascade,
  custom_title text,
  section_id   integer references public.section(id) on delete set null,
  url          text,
  is_cancelled boolean not null default false,
  note         text,
  created_by   uuid references public.profile(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint recording_identity_check check (
    (grade_id is not null and subject_id is not null and custom_title is null)
    or
    (grade_id is null and subject_id is null and custom_title is not null
     and length(trim(custom_title)) > 0)
  ),

  -- NULLs compare as distinct here, so several free-text rows per day are fine
  -- while a scheduled class can only appear once.
  constraint recording_class_key unique (class_date, grade_id, subject_id)
);

create index recording_date_idx on public.recording (class_date);

-- Stop the same one-off being added twice by accident.
create unique index recording_custom_title_key
  on public.recording (class_date, lower(trim(custom_title)))
  where custom_title is not null;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger recording_touch
  before update on public.recording
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- 3. Row Level Security
-- ===========================================================================

alter table public.section   enable row level security;
alter table public.recording enable row level security;

-- Sections are needed to group the Today screen, so any active admin reads
-- them; they are part of grade setup, so grades.manage edits them.
create policy "read sections" on public.section
  for select to authenticated
  using ((select public.is_active_admin()));

create policy "manage sections" on public.section
  for all to authenticated
  using ((select public.has_feature('grades.manage')))
  with check ((select public.has_feature('grades.manage')));

create policy "read recordings" on public.recording
  for select to authenticated
  using (
    (select public.has_feature('today.view'))
    or (select public.has_feature('recordings.manage'))
  );

create policy "manage recordings" on public.recording
  for all to authenticated
  using ((select public.has_feature('recordings.manage')))
  with check ((select public.has_feature('recordings.manage')));

-- ===========================================================================
-- 4. Audit
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

  elsif tg_table_name = 'recording' then
    select
      coalesce(
        v_row->>'custom_title',
        coalesce(g.name, 'grade #' || (v_row->>'grade_id'))
          || ' - ' || coalesce(s.name, 'subject #' || (v_row->>'subject_id'))
      ) || ' (' || (v_row->>'class_date') || ')'
    into v_label
    from (select 1) _
    left join public.grade   g on g.id = (v_row->>'grade_id')::int
    left join public.subject s on s.id = (v_row->>'subject_id')::int;

  elsif tg_table_name in ('grade', 'subject', 'section') then
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

revoke execute on function public.log_change() from public, anon, authenticated;

create trigger audit_section   after insert or update or delete on public.section   for each row execute function public.log_change();
create trigger audit_recording after insert or update or delete on public.recording for each row execute function public.log_change();

-- ===========================================================================
-- 5. New capability
-- ===========================================================================

insert into public.feature (key, label, category, sort_order) values
  ('recordings.manage', 'Add recording links and build the daily message', 'Today', 4);
