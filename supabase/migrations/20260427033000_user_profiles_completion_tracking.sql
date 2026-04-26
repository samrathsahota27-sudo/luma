alter table if exists public.user_profiles
  add column if not exists profile_completion_percent integer not null default 0,
  add column if not exists profile_completion_state jsonb not null default '{}'::jsonb;
