-- Monthly individual reflection counter (used with reflection_count_month for reset).
alter table public.user_profiles
  add column if not exists reflection_count integer not null default 0,
  add column if not exists reflection_count_month text;

comment on column public.user_profiles.reflection_count is
  'Count of individual reflections completed in reflection_count_month (YYYY-MM).';
comment on column public.user_profiles.reflection_count_month is
  'Calendar month key (YYYY-MM) for which reflection_count applies.';

-- Pro waitlist (server-side inserts only; RLS blocks direct client writes).
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_lower_unique unique (email)
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- No policies: anon/authenticated clients cannot read or write; service role bypasses RLS.
