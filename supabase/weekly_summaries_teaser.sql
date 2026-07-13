alter table weekly_summaries add column if not exists teaser text;

comment on column weekly_summaries.teaser is
  'Short (6-10 word) subject-line teaser for the weekly digest email, generated alongside the summary.';
