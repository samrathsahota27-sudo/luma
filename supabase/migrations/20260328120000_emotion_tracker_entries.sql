-- Emotional Tracker: one row per completed session (tag + short insight + time).
-- Run in Supabase SQL editor or via CLI after linking the project.

create table if not exists public.emotion_tracker_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  emotional_tag text not null,
  short_insight text not null,
  session_type text not null default 'individual'
    check (session_type in ('individual', 'couple', 'connect')),
  created_at timestamptz not null default now()
);

create index if not exists emotion_tracker_entries_user_created_desc
  on public.emotion_tracker_entries (user_id, created_at desc);

alter table public.emotion_tracker_entries enable row level security;

create policy "emotion_tracker_select_own"
  on public.emotion_tracker_entries for select
  using (auth.uid() = user_id);

create policy "emotion_tracker_insert_own"
  on public.emotion_tracker_entries for insert
  with check (auth.uid() = user_id);
