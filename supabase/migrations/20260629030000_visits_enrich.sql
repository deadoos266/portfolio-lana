-- Enrichit page_visits avec les mêmes détails que link_opens.
alter table public.page_visits add column if not exists city        text;
alter table public.page_visits add column if not exists device_type text;
alter table public.page_visits add column if not exists browser     text;
alter table public.page_visits add column if not exists os          text;
alter table public.page_visits add column if not exists ip          text;
