-- Add 'archived' to worker status options
alter table public.workers drop constraint workers_status_check;
alter table public.workers add constraint workers_status_check
  check (status in ('invited', 'pending', 'active', 'inactive', 'archived'));
