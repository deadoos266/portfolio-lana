-- ===========================================================================
-- Portfolio Lana — Schéma initial
-- ===========================================================================
-- Tables : projects (galerie/CMS), contact_messages (formulaire), page_visits
-- (analytics). + bucket de stockage d'images + politiques RLS.
-- C'est un point de départ : on ajustera les colonnes une fois le design défini.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Helper : met à jour automatiquement updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Table : projects (les réalisations affichées dans le portfolio)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  title         text not null,
  slug          text not null unique,
  summary       text,
  description   text,
  cover_image_url text,
  gallery_urls  text[] not null default '{}',
  tags          text[] not null default '{}',
  external_url  text,
  display_order integer not null default 0,
  published     boolean not null default false
);

create index if not exists projects_published_order_idx
  on public.projects (published, display_order);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table : contact_messages (messages envoyés via le formulaire de contact)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  is_read     boolean not null default false
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Table : page_visits (analytics simples des visites)
-- ---------------------------------------------------------------------------
create table if not exists public.page_visits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  path        text not null,
  referrer    text,
  user_agent  text,
  country     text
);

create index if not exists page_visits_created_idx
  on public.page_visits (created_at desc);

-- ===========================================================================
-- Row Level Security (RLS)
-- ===========================================================================
alter table public.projects         enable row level security;
alter table public.contact_messages enable row level security;
alter table public.page_visits      enable row level security;

-- --- projects : tout le monde lit les projets publiés, l'admin gère tout ----
create policy "projects_public_read_published"
  on public.projects for select
  using (published = true);

create policy "projects_admin_all"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- --- contact_messages : n'importe qui peut envoyer, l'admin lit/modifie ------
create policy "contact_anyone_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "contact_admin_read"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "contact_admin_update"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

-- --- page_visits : n'importe qui enregistre une visite, l'admin lit ----------
create policy "visits_anyone_insert"
  on public.page_visits for insert
  to anon, authenticated
  with check (true);

create policy "visits_admin_read"
  on public.page_visits for select
  to authenticated
  using (true);

-- ===========================================================================
-- Stockage : bucket public "portfolio" pour les images
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Lecture publique des images
create policy "portfolio_public_read"
  on storage.objects for select
  using (bucket_id = 'portfolio');

-- Upload / modification / suppression réservés à l'admin connecté
create policy "portfolio_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio');

create policy "portfolio_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio');

create policy "portfolio_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio');
