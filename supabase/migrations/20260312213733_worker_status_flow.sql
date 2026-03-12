-- Update worker status check to include invited and pending
alter table public.workers drop constraint workers_status_check;
alter table public.workers add constraint workers_status_check
  check (status in ('invited', 'pending', 'active', 'inactive'));

-- Set existing active workers to stay active
-- New workers created by admin will default to 'invited'
alter table public.workers alter column status set default 'invited';
