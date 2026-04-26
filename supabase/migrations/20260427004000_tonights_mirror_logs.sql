create table if not exists public.tonight_mirror_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_date date not null default current_date,
  cycle_week integer,
  onboarding_goals jsonb not null default '[]'::jsonb,
  question_for_you text not null,
  question_for_them text not null,
  rationale text,
  answer_for_you text,
  answer_for_them text,
  mirror_reflection text,
  micro_shift_insight text,
  saved_as_ritual boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tonight_mirror_logs_user_date_idx
  on public.tonight_mirror_logs (user_id, question_date);

create index if not exists tonight_mirror_logs_user_created_idx
  on public.tonight_mirror_logs (user_id, created_at desc);

alter table public.tonight_mirror_logs enable row level security;

drop policy if exists "Users can read own tonight logs" on public.tonight_mirror_logs;
create policy "Users can read own tonight logs"
  on public.tonight_mirror_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tonight logs" on public.tonight_mirror_logs;
create policy "Users can insert own tonight logs"
  on public.tonight_mirror_logs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tonight logs" on public.tonight_mirror_logs;
create policy "Users can update own tonight logs"
  on public.tonight_mirror_logs
  for update
  using (auth.uid() = user_id);
