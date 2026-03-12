-- Admin settings table
create table public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  address_line1 text not null default '',
  address_line2 text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  stripe_customer_id text,
  card_last4 text,
  card_brand text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only one admin settings row allowed
create unique index idx_admin_settings_singleton on public.admin_settings ((true));

-- Trigger for updated_at
create trigger admin_settings_updated_at
  before update on public.admin_settings
  for each row execute function update_updated_at();

-- Payments table
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  time_spent_minutes numeric(10,2) not null default 0,
  hourly_rate numeric(10,2) not null default 0,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'denied', 'processed', 'failed')),
  stripe_payment_intent_id text,
  reviewed_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_worker on public.payments(worker_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_task on public.payments(task_id);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function update_updated_at();

-- Add balance and bank info to workers
alter table public.workers
  add column balance numeric(10,2) not null default 0,
  add column bank_account_last4 text,
  add column bank_routing_last4 text,
  add column stripe_connect_account_id text;
