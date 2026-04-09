alter table public.waitlist
  add column if not exists source text;

comment on column public.waitlist.source is 'Signup origin (e.g. home, pricing, pro-waitlist).';
