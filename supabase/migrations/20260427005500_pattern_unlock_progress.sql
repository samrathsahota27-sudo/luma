create table if not exists public.pattern_unlock_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_start_date date not null,
  layer_key text not null,
  generated_insight text,
  selected_images jsonb not null default '[]'::jsonb,
  unlocked_at timestamptz,
  generated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pattern_unlock_progress_unique_idx
  on public.pattern_unlock_progress (user_id, cycle_start_date, layer_key);

create index if not exists pattern_unlock_progress_user_created_idx
  on public.pattern_unlock_progress (user_id, created_at desc);

alter table public.pattern_unlock_progress enable row level security;

drop policy if exists "Users can read own pattern unlocks" on public.pattern_unlock_progress;
create policy "Users can read own pattern unlocks"
  on public.pattern_unlock_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pattern unlocks" on public.pattern_unlock_progress;
create policy "Users can insert own pattern unlocks"
  on public.pattern_unlock_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pattern unlocks" on public.pattern_unlock_progress;
create policy "Users can update own pattern unlocks"
  on public.pattern_unlock_progress
  for update
  using (auth.uid() = user_id);
