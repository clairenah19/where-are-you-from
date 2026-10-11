-- Where are you from? — Supabase schema.
-- Run this once in: Supabase dashboard -> SQL Editor -> New query -> Run.

create table if not exists public.pins (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  greeting     text not null check (char_length(greeting) between 1 and 40),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  country_name text not null check (char_length(country_name) between 2 and 80),
  lat          double precision not null check (lat between -90 and 90),
  lng          double precision not null check (lng between -180 and 180)
);

create index if not exists pins_created_at_idx on public.pins (created_at desc);

-- Row Level Security: the public anon key may read pins and add new ones, and
-- nothing else (no update, no delete). Remove pins from the dashboard.
alter table public.pins enable row level security;

drop policy if exists "pins are readable by everyone" on public.pins;
create policy "pins are readable by everyone"
  on public.pins for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone can add a pin" on public.pins;
create policy "anyone can add a pin"
  on public.pins for insert
  to anon, authenticated
  with check (true);

grant select, insert on public.pins to anon, authenticated;

-- Realtime: lets other visitors' pins appear on your globe live.
do $$
begin
  alter publication supabase_realtime add table public.pins;
exception when duplicate_object then
  null; -- already added
end $$;
