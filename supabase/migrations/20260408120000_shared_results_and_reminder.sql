-- Ephemeral public shares for couple results (server insert via service role).
create table if not exists public.shared_results (
  id uuid primary key default gen_random_uuid(),
  result_json jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists shared_results_expires_at_idx on public.shared_results (expires_at);

alter table public.shared_results enable row level security;

drop policy if exists "Public read non-expired shared results" on public.shared_results;
create policy "Public read non-expired shared results"
  on public.shared_results
  for select
  using (expires_at > now());

-- No insert/update/delete policies for authenticated roles — only service role bypasses RLS.

-- Retention: user tapped "Remind me" on a result page
alter table public.user_profiles
  add column if not exists reflection_reminder_requested_at timestamptz;
