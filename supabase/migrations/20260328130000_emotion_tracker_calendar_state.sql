-- Optional mood for Calendar of Us (calm | friction | distance | clarity).
alter table public.emotion_tracker_entries
  add column if not exists calendar_state text;
