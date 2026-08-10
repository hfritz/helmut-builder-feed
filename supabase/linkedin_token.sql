create table linkedin_token (
  id boolean primary key default true,
  issued_at timestamptz not null,
  check (id)
);

alter table linkedin_token enable row level security;

comment on table linkedin_token is
  'Singleton row tracking when the current LinkedIn access token was issued, so the cron job can warn ahead of its ~60-day expiry.';

-- Seed with the re-auth that happened today (2026-08-10), since that predates this table.
insert into linkedin_token (id, issued_at) values (true, now());
