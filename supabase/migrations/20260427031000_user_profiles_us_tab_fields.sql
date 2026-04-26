alter table if exists public.user_profiles
  add column if not exists profile_photo_url text,
  add column if not exists anniversary_date date,
  add column if not exists birthday_date date;
