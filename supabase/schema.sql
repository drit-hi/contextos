-- ContextOS database schema — FUTURE IMPLEMENTATION DRAFT
--
-- NOT USED by the app today. ContextOS currently stores memories in the
-- browser's localStorage only (see lib/storage.ts). Nothing in the codebase
-- connects to Supabase or Postgres, and there is no authentication, so the
-- user_id / auth.uid() policies below have nothing to populate them yet.
-- Kept as a starting point if server-side storage is added later.

create extension if not exists "uuid-ossp";

-- Memories table
create table if not exists memories (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null,
  title        text not null check (char_length(title) between 1 and 500),
  content      text not null check (char_length(content) between 1 and 10000),
  memory_type  text not null check (memory_type in ('note','idea','decision','goal','observation','reflection')),
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for user queries
create index if not exists memories_user_id_idx on memories (user_id);
create index if not exists memories_updated_at_idx on memories (updated_at desc);

-- Full-text search index
create index if not exists memories_fts_idx
  on memories using gin(to_tsvector('english', title || ' ' || content));

-- Row Level Security: users can only access their own memories
alter table memories enable row level security;

create policy "Users can read own memories"
  on memories for select
  using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own memories"
  on memories for update
  using (auth.uid() = user_id);

create policy "Users can delete own memories"
  on memories for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger memories_updated_at
  before update on memories
  for each row execute function update_updated_at();
