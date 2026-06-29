-- ===========================================================================
-- Suivi de candidatures alternance + liens traqués
-- ===========================================================================
-- applications : les candidatures (entreprise, poste, statut, notes)
-- tracked_links : 1 lien court unique par candidature -> redirige + log
-- link_opens    : chaque ouverture d'un lien (date, géo, appareil...)
--
-- Sécurité : tout est réservé à l'admin connecté (Lana). La redirection
-- publique passe par la clé service_role côté serveur (contourne RLS), donc
-- aucune de ces tables n'est lisible publiquement.
-- ===========================================================================

-- --- Candidatures ----------------------------------------------------------
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  company_name  text not null,
  role          text,
  contact_name  text,
  contact_email text,
  -- statut libre validé côté app : a_envoyer | envoyee | ouverte | relance
  --                                | entretien | acceptee | refusee
  status        text not null default 'a_envoyer',
  notes         text,
  applied_at    date
);

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- --- Liens traqués ---------------------------------------------------------
create table if not exists public.tracked_links (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  application_id  uuid references public.applications(id) on delete cascade,
  slug            text not null unique,
  destination_url text not null,
  label           text,
  is_active       boolean not null default true
);

create index if not exists tracked_links_application_idx
  on public.tracked_links (application_id);

-- --- Ouvertures ------------------------------------------------------------
create table if not exists public.link_opens (
  id          uuid primary key default gen_random_uuid(),
  opened_at   timestamptz not null default now(),
  link_id     uuid not null references public.tracked_links(id) on delete cascade,
  ip          text,
  country     text,
  city        text,
  user_agent  text,
  device_type text,
  browser     text,
  os          text,
  referrer    text
);

create index if not exists link_opens_link_idx
  on public.link_opens (link_id, opened_at desc);

-- ===========================================================================
-- RLS : accès réservé aux utilisateurs authentifiés (l'admin)
-- ===========================================================================
alter table public.applications  enable row level security;
alter table public.tracked_links enable row level security;
alter table public.link_opens    enable row level security;

create policy "applications_admin_all"
  on public.applications for all
  to authenticated using (true) with check (true);

create policy "tracked_links_admin_all"
  on public.tracked_links for all
  to authenticated using (true) with check (true);

create policy "link_opens_admin_all"
  on public.link_opens for all
  to authenticated using (true) with check (true);
