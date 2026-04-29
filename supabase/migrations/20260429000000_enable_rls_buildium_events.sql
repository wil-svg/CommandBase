-- Enable Row-Level Security on buildium_events.
-- This table stores raw Buildium webhook payloads and is only meant to be
-- read/written by the server using the Supabase service_role key (which
-- bypasses RLS). With RLS enabled and no policies granted, the anon and
-- authenticated roles cannot reach this data via PostgREST.
alter table public.buildium_events enable row level security;
