-- ===========================================================================
-- Rubriques nommées au sein d'une carte parcours (nav + sections ancrées,
-- comme "Mon projet professionnel / Ma vision du journalisme / Mon parcours"
-- sur la page d'accueil). Chaque élément : {"id","label","content"}.
-- Tableau vide par défaut : aucun changement pour les cartes existantes.
-- ===========================================================================

alter table public.parcours_cards
  add column if not exists sections jsonb not null default '[]'::jsonb;

-- Rubriques des concours d'entrée aux écoles de journalisme.
update public.parcours_cards
set sections = '[
  {"id": "ijba", "label": "IJBA", "content": ""},
  {"id": "ifp", "label": "IFP", "content": ""},
  {"id": "celsa", "label": "CELSA", "content": ""},
  {"id": "cergy", "label": "Cergy", "content": ""},
  {"id": "esj-lille", "label": "ESJ Lille", "content": ""},
  {"id": "iej", "label": "IEJ", "content": ""},
  {"id": "universite-lorraine", "label": "Universite de Lorraine", "content": ""}
]'::jsonb
where slug = 'concours';
