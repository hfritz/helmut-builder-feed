create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  token uuid not null default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index subscribers_token_idx on subscribers (token);
