-- ============================================================
-- StreamLink — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  display_name    text not null,
  handle          text unique not null,
  bio             text,
  avatar_url      text,
  banner_url      text,
  category        text,
  platforms       text[]    default '{}',
  location        text,
  website         text,
  twitch_url      text,
  kick_url        text,
  youtube_url     text,
  followers_count integer   default 0,
  connections_count integer default 0,
  is_live         boolean   default false,
  is_verified     boolean   default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── POSTS ───────────────────────────────────────────────────
create table public.posts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  content        text not null,
  post_type      text default 'text',   -- text | clip | milestone | collab | setup
  media_url      text,
  clip_platform  text,                  -- twitch | kick | youtube
  clip_title     text,
  clip_views     integer default 0,
  likes_count    integer default 0,
  comments_count integer default 0,
  created_at     timestamptz default now()
);

-- ── POST LIKES ───────────────────────────────────────────────
create table public.post_likes (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid references public.posts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- ── CONNECTIONS ──────────────────────────────────────────────
create table public.connections (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status       text default 'pending',  -- pending | accepted | declined
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(requester_id, addressee_id)
);

-- ── MESSAGES ─────────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content     text not null,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ── JOBS ─────────────────────────────────────────────────────
create table public.jobs (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid references public.profiles(id) on delete cascade,
  title        text not null,
  description  text,
  job_type     text,          -- sponsored_stream | ambassador | full_time | contract
  platform     text,
  pay_min      integer,
  pay_max      integer,
  pay_period   text,          -- stream | month | year | event
  requirements text[],
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- ── JOB APPLICATIONS ─────────────────────────────────────────
create table public.job_applications (
  id          uuid primary key default uuid_generate_v4(),
  job_id      uuid references public.jobs(id) on delete cascade,
  applicant_id uuid references public.profiles(id) on delete cascade,
  message     text,
  media_kit_url text,
  status      text default 'pending',   -- pending | reviewing | accepted | rejected
  created_at  timestamptz default now(),
  unique(job_id, applicant_id)
);

-- ── COMPANIES ────────────────────────────────────────────────
create table public.companies (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid references auth.users(id) on delete cascade,
  name         text not null,
  slug         text unique not null,
  description  text,
  industry     text,
  website      text,
  logo_url     text,
  banner_url   text,
  location     text,
  looking_for  text[],
  followers_count integer default 0,
  is_verified  boolean default false,
  created_at   timestamptz default now()
);

-- ── FOLLOWS ──────────────────────────────────────────────────
create table public.follows (
  id          uuid primary key default uuid_generate_v4(),
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(follower_id, following_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.posts         enable row level security;
alter table public.post_likes    enable row level security;
alter table public.connections   enable row level security;
alter table public.messages      enable row level security;
alter table public.jobs          enable row level security;
alter table public.job_applications enable row level security;
alter table public.companies     enable row level security;
alter table public.follows       enable row level security;

-- PROFILES: anyone can read, only owner can write
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- POSTS: anyone can read, only owner can insert/delete
create policy "posts_select_all"     on public.posts for select using (true);
create policy "posts_insert_own"     on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_delete_own"     on public.posts for delete using (auth.uid() = user_id);

-- POST LIKES: anyone can read, auth users can insert
create policy "post_likes_select"    on public.post_likes for select using (true);
create policy "post_likes_insert"    on public.post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete"    on public.post_likes for delete using (auth.uid() = user_id);

-- CONNECTIONS: parties involved can see
create policy "connections_select"   on public.connections for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "connections_insert"   on public.connections for insert with check (auth.uid() = requester_id);
create policy "connections_update"   on public.connections for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- MESSAGES: only sender and receiver can see
create policy "messages_select"      on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_insert"      on public.messages for insert with check (auth.uid() = sender_id);

-- JOBS: public read, company owners write
create policy "jobs_select_all"      on public.jobs for select using (true);
create policy "jobs_insert_own"      on public.jobs for insert with check (auth.uid() = company_id);
create policy "jobs_update_own"      on public.jobs for update using (auth.uid() = company_id);

-- APPLICATIONS: applicant and company can see
create policy "apps_select"          on public.job_applications for select
  using (auth.uid() = applicant_id);
create policy "apps_insert"          on public.job_applications for insert with check (auth.uid() = applicant_id);

-- COMPANIES: public read, owner writes
create policy "companies_select_all" on public.companies for select using (true);
create policy "companies_insert_own" on public.companies for insert with check (auth.uid() = owner_id);
create policy "companies_update_own" on public.companies for update using (auth.uid() = owner_id);

-- FOLLOWS: public read, auth users can follow
create policy "follows_select_all"   on public.follows for select using (true);
create policy "follows_insert"       on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete"       on public.follows for delete using (auth.uid() = follower_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-increment likes_count
create or replace function public.increment_likes()
returns trigger language plpgsql as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$;
create trigger on_post_like_insert
  after insert on public.post_likes
  for each row execute procedure public.increment_likes();

create or replace function public.decrement_likes()
returns trigger language plpgsql as $$
begin
  update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;
create trigger on_post_like_delete
  after delete on public.post_likes
  for each row execute procedure public.decrement_likes();

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- REALTIME (enable for live feed + messages)
-- ============================================================
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.connections;
