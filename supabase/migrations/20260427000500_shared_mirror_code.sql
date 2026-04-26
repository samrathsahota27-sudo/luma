alter table if exists public.couple_sessions
  add column if not exists mirror_code text,
  add column if not exists mirror_state text,
  add column if not exists mirror_joined_at timestamptz,
  add column if not exists partner_a_recent_selections jsonb,
  add column if not exists partner_b_recent_selections jsonb,
  add column if not exists mirror_overlap jsonb;

update public.couple_sessions
set mirror_state = coalesce(mirror_state, 'waiting')
where mirror_state is null;

update public.couple_sessions
set partner_a_recent_selections = coalesce(partner_a_recent_selections, '[]'::jsonb)
where partner_a_recent_selections is null;

update public.couple_sessions
set partner_b_recent_selections = coalesce(partner_b_recent_selections, '[]'::jsonb)
where partner_b_recent_selections is null;

alter table if exists public.couple_sessions
  alter column mirror_state set default 'waiting';

alter table if exists public.couple_sessions
  alter column partner_a_recent_selections set default '[]'::jsonb;

alter table if exists public.couple_sessions
  alter column partner_b_recent_selections set default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'couple_sessions_mirror_state_check'
  ) then
    alter table public.couple_sessions
      add constraint couple_sessions_mirror_state_check
      check (mirror_state in ('waiting', 'connected'));
  end if;
end $$;

create unique index if not exists couple_sessions_mirror_code_unique_idx
  on public.couple_sessions (mirror_code)
  where mirror_code is not null;
