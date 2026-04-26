create table if not exists public.repair_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id text,
  created_at timestamptz not null default now(),
  patterns_json jsonb not null default '{}'::jsonb,
  strategy text,
  outcome_rating integer,
  note text,
  drift_before numeric,
  tension_before numeric,
  drift_after numeric,
  tension_after numeric
);

create index if not exists repair_logs_user_created_idx
  on public.repair_logs (user_id, created_at desc);

alter table public.repair_logs enable row level security;

drop policy if exists "Users can read own repair logs" on public.repair_logs;
create policy "Users can read own repair logs"
  on public.repair_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own repair logs" on public.repair_logs;
create policy "Users can insert own repair logs"
  on public.repair_logs
  for insert
  with check (auth.uid() = user_id);
