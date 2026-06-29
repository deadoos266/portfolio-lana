-- Marque les ouvertures/visites automatiques (robots) pour les distinguer des
-- vraies personnes dans le dashboard.
alter table public.link_opens  add column if not exists is_bot     boolean not null default false;
alter table public.link_opens  add column if not exists bot_reason text;
alter table public.page_visits add column if not exists is_bot     boolean not null default false;
alter table public.page_visits add column if not exists bot_reason text;
