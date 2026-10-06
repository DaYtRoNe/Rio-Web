-- Rio Online School — admin schema
-- Mirrors the old RioSchool MySQL database (grade / subject / grade_has_subject / settings)
-- with constraints enforced at the DB level instead of in application code.

create table public.grade (
  id         serial primary key,
  name       text not null unique check (length(trim(name)) > 0),
  priority   integer not null unique,
  created_at timestamptz not null default now()
);

create table public.subject (
  id         serial primary key,
  name       text not null unique check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

-- weekday: 0 = Sunday … 6 = Saturday (matches JavaScript Date.getDay())
create table public.timetable (
  id         serial primary key,
  grade_id   integer not null references public.grade(id)   on delete cascade,
  subject_id integer not null references public.subject(id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6),
  created_at timestamptz not null default now(),
  unique (grade_id, subject_id, weekday)
);

create index timetable_weekday_idx on public.timetable(weekday);

-- Replaces the old "settings" table: saved text snippets that get copied to clipboard
-- (Drive links, meeting passwords, etc.)
create table public.snippet (
  id         serial primary key,
  label      text not null check (length(trim(label)) > 0),
  content    text not null unique check (length(trim(content)) > 0),
  is_secret  boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: only signed-in users (the admin) can touch anything.
-- The public site uses the anon key and gets nothing — no anon policies exist.
-- ---------------------------------------------------------------------------
alter table public.grade     enable row level security;
alter table public.subject   enable row level security;
alter table public.timetable enable row level security;
alter table public.snippet   enable row level security;

create policy "admin full access" on public.grade
  for all to authenticated using (true) with check (true);

create policy "admin full access" on public.subject
  for all to authenticated using (true) with check (true);

create policy "admin full access" on public.timetable
  for all to authenticated using (true) with check (true);

create policy "admin full access" on public.snippet
  for all to authenticated using (true) with check (true);
