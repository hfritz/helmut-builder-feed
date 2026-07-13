create table failed_sends (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  email text not null,
  error text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index failed_sends_pending_idx on failed_sends (week_start) where resolved_at is null;

alter table failed_sends enable row level security;
