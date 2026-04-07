create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  pattern_history jsonb default '[]'::jsonb,
  reflection_history jsonb default '[]'::jsonb,
  attachment_style text,
  emotional_tags jsonb default '[]'::jsonb,
  depth_tone_preference text default 'satin',
  couple_sessions jsonb default '[]'::jsonb,
  created_at timestamp default now(),
  last_updated timestamp default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

alter table if exists public.couple_sessions
  add column if not exists user_a_id uuid references auth.users(id),
  add column if not exists user_b_id uuid references auth.users(id);
