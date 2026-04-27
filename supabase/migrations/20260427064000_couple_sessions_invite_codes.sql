alter table couple_sessions
  add column if not exists invite_code text unique,
  add column if not exists user_a_id uuid,
  add column if not exists user_b_id uuid,
  add column if not exists name_a text,
  add column if not exists name_b text;

create unique index if not exists couple_sessions_invite_code_idx
  on couple_sessions(invite_code);
