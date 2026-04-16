alter table if exists public.user_profiles
  add column if not exists start_date date;

update public.user_profiles
set start_date = coalesce(start_date, created_at::date, current_date)
where start_date is null;

alter table if exists public.user_profiles
  alter column start_date set default current_date;
