-- Anti-force-brute du code d'accès : suit les tentatives ratées par IP et
-- bloque temporairement après trop d'échecs.
create table if not exists public.login_attempts (
  ip           text primary key,
  fails        integer not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
-- Aucune politique publique : accès uniquement via la clé service_role serveur.
