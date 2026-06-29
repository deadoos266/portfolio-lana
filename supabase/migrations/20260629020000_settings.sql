-- ===========================================================================
-- Réglages de l'app (clé/valeur) — sert à stocker le code d'accès du dashboard
-- pour pouvoir le changer depuis l'interface (pas figé dans une variable d'env).
-- Le code n'est jamais stocké en clair : on garde un HMAC (clé = secret serveur).
-- ===========================================================================
create table if not exists public.app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "app_settings_admin_all"
  on public.app_settings for all
  to authenticated using (true) with check (true);
