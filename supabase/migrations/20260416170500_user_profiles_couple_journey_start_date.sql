alter table if exists public.user_profiles
  add column if not exists couple_journey_start_date date;

update public.user_profiles
set couple_journey_start_date = coalesce(couple_journey_start_date, start_date, created_at::date, current_date)
where couple_journey_start_date is null;

alter table if exists public.user_profiles
  alter column couple_journey_start_date set default current_date;
