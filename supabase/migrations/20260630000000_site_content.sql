-- ===========================================================================
-- Cartes "Mon parcours" (carrousel swipable de 7 éléments)
-- ===========================================================================
create table if not exists public.parcours_cards (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  title         text not null,
  description   text,
  image_url     text,
  link_url      text,
  display_order integer not null default 0
);

create index if not exists parcours_cards_order_idx
  on public.parcours_cards (display_order);

create trigger parcours_cards_set_updated_at
  before update on public.parcours_cards
  for each row execute function public.set_updated_at();

alter table public.parcours_cards enable row level security;
create policy "parcours_public_read"
  on public.parcours_cards for select using (true);
create policy "parcours_admin_all"
  on public.parcours_cards for all
  to authenticated using (true) with check (true);

-- Seed des 7 titres dans l'ordre de Lana.
insert into public.parcours_cards (title, display_order) values
  ('Parcours artistique et scolaire', 1),
  ('Stage « Mouvement »', 2),
  ('Les concours d''entrée aux écoles de journalisme', 3),
  ('Articles', 4),
  ('Critiques artistiques', 5),
  ('Calendrier d''alternance', 6),
  ('CV', 7)
on conflict do nothing;
