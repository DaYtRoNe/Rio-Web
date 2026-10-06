-- Two small corrections to 0005.

-- `recordings.manage` was given sort_order 4, which collided with
-- `timetable.view` and made the user permission list order unstable.
update public.feature set sort_order =  5 where key = 'timetable.view';
update public.feature set sort_order =  6 where key = 'timetable.manage';
update public.feature set sort_order =  7 where key = 'grades.manage';
update public.feature set sort_order =  8 where key = 'subjects.manage';
update public.feature set sort_order =  9 where key = 'snippets.manage';
update public.feature set sort_order = 10 where key = 'content.manage';
update public.feature set sort_order = 11 where key = 'audit.view';

-- Pin the search path, like every other function in this schema.
alter function public.touch_updated_at() set search_path = public;
