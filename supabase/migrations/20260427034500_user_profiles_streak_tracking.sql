alter table if exists public.user_profiles
  add column if not exists last_activity_date date,
  add column if not exists current_streak integer not null default 0;
