-- Workers table
create table public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  phone text not null default '',
  pin text not null,
  hourly_rate numeric(10,2) not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null,
  subcategory text not null default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  assigned_to uuid not null references public.workers(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  created_by text not null default 'admin',
  started_at timestamptz,
  completed_at timestamptz,
  time_spent_minutes numeric(10,2) not null default 0,
  cost numeric(10,2) not null default 0,
  notes text not null default ''
);

-- Sessions table
create table public.sessions (
  token uuid primary key default gen_random_uuid(),
  role text not null check (role in ('admin', 'worker')),
  worker_id uuid references public.workers(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_status on public.tasks(status);
create index idx_sessions_expires on public.sessions(expires_at);
create index idx_workers_status on public.workers(status);

-- Auto-update updated_at on workers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger workers_updated_at
  before update on public.workers
  for each row execute function update_updated_at();
