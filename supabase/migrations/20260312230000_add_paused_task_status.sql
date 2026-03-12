-- Add 'paused' to task status options
alter table public.tasks drop constraint tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('pending', 'in_progress', 'paused', 'completed', 'cancelled'));
