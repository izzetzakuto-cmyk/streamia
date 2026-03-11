-- ============================================================
-- StreamLink — Stripe / Subscriptions Schema
-- Run this in Supabase SQL Editor AFTER the first migration
-- ============================================================

create table public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid references auth.users(id) on delete cascade unique,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  plan                    text default 'basic',   -- basic | pro | business
  status                  text default 'active',  -- active | canceled | past_due | trialing
  current_period_end      timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

-- Allow service role to update (for webhooks)
create policy "subscriptions_update_service" on public.subscriptions
  for update using (true);

-- Helper: get current plan for a user
create or replace function public.get_user_plan(uid uuid)
returns text language sql security definer as $$
  select coalesce(
    (select plan from public.subscriptions where user_id = uid and status in ('active','trialing')),
    'basic'
  );
$$;
