-- ===========================================================================
-- Liste d'URLs d'articles externes à afficher sur la page dédiée d'une carte
-- du parcours (chaque URL devient une carte-aperçu avec image + titre + extrait).
-- ===========================================================================

alter table public.parcours_cards
  add column if not exists article_urls text[] not null default '{}';
