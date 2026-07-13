alter table stories add column if not exists rank integer;

comment on column stories.rank is
  'Editorial importance order assigned by the curation model (1 = most important). Drives Top Picks and section ordering.';
