-- ===========================================================================
-- Format de l'image de couverture pour chaque carte du parcours.
-- Trois choix : 'square' (1:1), 'landscape' (3:2), 'portrait' (3:4).
-- ===========================================================================

alter table public.parcours_cards
  add column if not exists image_aspect text not null default 'square';

-- Seed : le calendrier d'alternance passe en paysage par défaut.
update public.parcours_cards
  set image_aspect = 'landscape'
  where slug = 'calendrier' and image_aspect = 'square';
