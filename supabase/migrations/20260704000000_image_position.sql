-- ===========================================================================
-- Réglages de cadrage (zoom + position X/Y) pour l'image de chaque carte.
-- Les réglages banderole / photomaton sont stockés dans app_settings.
-- ===========================================================================

alter table public.parcours_cards
  add column if not exists image_zoom integer not null default 100,
  add column if not exists image_pos_x integer not null default 50,
  add column if not exists image_pos_y integer not null default 50;
