alter table if exists public.user_profiles
  add column if not exists feature_activity jsonb;

update public.user_profiles
set feature_activity = coalesce(feature_activity, '[]'::jsonb)
where feature_activity is null;

alter table if exists public.user_profiles
  alter column feature_activity set default '[]'::jsonb;

alter table if exists public.user_profiles
  alter column feature_activity set not null;
