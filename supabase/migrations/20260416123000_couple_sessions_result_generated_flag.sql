alter table if exists public.couple_sessions
  add column if not exists result_generated boolean;

update public.couple_sessions
set result_generated = case
  when result is not null then true
  else false
end
where result_generated is null;

alter table if exists public.couple_sessions
  alter column result_generated set default false;

alter table if exists public.couple_sessions
  alter column result_generated set not null;
