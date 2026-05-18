-- Run this in Supabase SQL editor to create chat persistence tables

create table if not exists public.chat_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index if not exists idx_chat_sessions_updated_at on public.chat_sessions(updated_at desc);

create table if not exists public.chat_messages (
  id uuid primary key,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_query text not null,
  assistant_response text not null,
  sources jsonb not null default '[]'::jsonb,
  latency double precision,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_session_id on public.chat_messages(session_id);
create index if not exists idx_chat_messages_user_id on public.chat_messages(user_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Policies are optional for service-role access, but required for anon/authenticated direct access.
-- Keep them idempotent.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_sessions' and policyname = 'chat_sessions_owner_select'
  ) then
    create policy chat_sessions_owner_select on public.chat_sessions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_sessions' and policyname = 'chat_sessions_owner_insert'
  ) then
    create policy chat_sessions_owner_insert on public.chat_sessions
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_sessions' and policyname = 'chat_sessions_owner_update'
  ) then
    create policy chat_sessions_owner_update on public.chat_sessions
      for update using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_messages' and policyname = 'chat_messages_owner_select'
  ) then
    create policy chat_messages_owner_select on public.chat_messages
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_messages' and policyname = 'chat_messages_owner_insert'
  ) then
    create policy chat_messages_owner_insert on public.chat_messages
      for insert with check (auth.uid() = user_id);
  end if;
end
$$;
