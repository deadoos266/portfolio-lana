-- ===========================================================================
-- Pages dédiées à chaque carte "Mon parcours".
-- Chaque carte devient cliquable et mène à sa propre page interne.
-- ===========================================================================

-- Slug URL-friendly (unique) pour l'adresse /parcours/<slug>
alter table public.parcours_cards
  add column if not exists slug text;

-- Contenu long éditable depuis le dashboard (supporte *italique* et **gras**)
alter table public.parcours_cards
  add column if not exists content text;

-- Galerie d'images en plus de l'image de couverture
alter table public.parcours_cards
  add column if not exists gallery_urls text[] not null default '{}';

-- Seed des slugs pour les 7 cartes existantes (dans l'ordre display_order)
update public.parcours_cards set slug = 'artistique-scolaire' where display_order = 1 and slug is null;
update public.parcours_cards set slug = 'stage-mouvement'      where display_order = 2 and slug is null;
update public.parcours_cards set slug = 'concours'             where display_order = 3 and slug is null;
update public.parcours_cards set slug = 'articles'             where display_order = 4 and slug is null;
update public.parcours_cards set slug = 'critiques'            where display_order = 5 and slug is null;
update public.parcours_cards set slug = 'calendrier'           where display_order = 6 and slug is null;
update public.parcours_cards set slug = 'cv'                   where display_order = 7 and slug is null;

-- Contrainte d'unicité (une fois que tous les slugs sont remplis)
create unique index if not exists parcours_cards_slug_uniq
  on public.parcours_cards (slug)
  where slug is not null;
