alter table if exists public.user_profiles
  add column if not exists onboarding_goals jsonb,
  add column if not exists onboarding_improve_text text,
  add column if not exists onboarding_strength_text text,
  add column if not exists mirror_summary text,
  add column if not exists onboarding_completed_at timestamptz;

update public.user_profiles
set onboarding_goals = coalesce(onboarding_goals, '[]'::jsonb)
where onboarding_goals is null;

alter table if exists public.user_profiles
  alter column onboarding_goals set default '[]'::jsonb;
