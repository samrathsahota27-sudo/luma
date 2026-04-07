alter table if exists public.couple_sessions
  add column if not exists result jsonb,
  add column if not exists generated_at timestamptz;
