-- Enable required extension for UUID generation if not already enabled
create extension if not exists pgcrypto;

-- 1) Roles enum and user_roles table
create type if not exists public.app_role as enum ('admin', 'moderator', 'user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles (avoids recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$$;

-- RLS policies for user_roles (read own; admins read/manage all)
create policy if not exists "Users can read their own roles"
  on public.user_roles for select
  to authenticated
  using ( auth.uid() = user_id );

create policy if not exists "Admins can read all roles"
  on public.user_roles for select
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

create policy if not exists "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') )
  with check ( public.has_role(auth.uid(), 'admin') );

-- 2) Profiles table with block flag
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Generic updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger on profiles
create trigger if not exists update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Insert profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger if not exists on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies for profiles
create policy if not exists "Users can select their own profile"
  on public.profiles for select
  to authenticated
  using ( auth.uid() = id );

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ( auth.uid() = id );

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ( auth.uid() = id );

create policy if not exists "Admins can select all profiles"
  on public.profiles for select
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

create policy if not exists "Admins can update all profiles"
  on public.profiles for update
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

-- 3) Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  starter_user_id uuid not null references auth.users(id) on delete cascade,
  partner_user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.conversations enable row level security;

create policy if not exists "Participants can select conversation"
  on public.conversations for select
  to authenticated
  using ( auth.uid() in (starter_user_id, partner_user_id) );

create policy if not exists "Participants can insert conversation"
  on public.conversations for insert
  to authenticated
  with check ( auth.uid() in (starter_user_id, partner_user_id) );

create policy if not exists "Participants can update conversation"
  on public.conversations for update
  to authenticated
  using ( auth.uid() in (starter_user_id, partner_user_id) );

create policy if not exists "Admins can read all conversations"
  on public.conversations for select
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

-- 4) Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('text','image','system')),
  content text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Helper using/with-check ensuring membership in conversation
create policy if not exists "Participants can select messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.starter_user_id, c.partner_user_id)
    )
  );

create policy if not exists "Participants can insert messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_user_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.starter_user_id, c.partner_user_id)
    )
  );

create policy if not exists "Senders can delete their messages"
  on public.messages for delete
  to authenticated
  using ( sender_user_id = auth.uid() );

create policy if not exists "Admins can read all messages"
  on public.messages for select
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

-- 5) Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy if not exists "Users can create their own reports"
  on public.reports for insert
  to authenticated
  with check ( reporter_user_id = auth.uid() );

create policy if not exists "Users can view their own reports"
  on public.reports for select
  to authenticated
  using ( reporter_user_id = auth.uid() );

create policy if not exists "Admins can view all reports"
  on public.reports for select
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

create policy if not exists "Admins can update reports"
  on public.reports for update
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );

-- 6) Summaries (per-user visibility)
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text,
  created_at timestamptz not null default now()
);

alter table public.summaries enable row level security;

create policy if not exists "Users can read their own summaries"
  on public.summaries for select
  to authenticated
  using ( user_id = auth.uid() );

create policy if not exists "Users can insert their own summaries"
  on public.summaries for insert
  to authenticated
  with check ( user_id = auth.uid() );

create policy if not exists "Admins can read all summaries"
  on public.summaries for select
  to authenticated
  using ( public.has_role(auth.uid(), 'admin') );
