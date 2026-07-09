-- ===========================================================================
-- Mode d'affichage de la galerie d'une carte parcours : "grid" (grille,
-- comportement actuel) ou "carousel" (une vignette a la fois, fleches
-- precedent/suivant, transition en fondu). Choix independant par carte.
-- ===========================================================================

alter table public.parcours_cards
  add column if not exists gallery_layout text not null default 'grid';
