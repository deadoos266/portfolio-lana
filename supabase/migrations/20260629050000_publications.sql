-- ===========================================================================
-- Publications (portfolio journalisme) — articles écrits, audio, vidéo.
-- Remplace conceptuellement la table "projects" générique.
-- ===========================================================================
create table if not exists public.publications (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  title           text not null,
  media_type      text not null default 'ecrit', -- ecrit | audio | video
  outlet          text,                            -- le média (ex: Ouest-France)
  published_date  date,
  url             text,                            -- lien vers l'article/son/vidéo
  category        text,                            -- rubrique (politique, culture…)
  excerpt         text,                            -- chapô / extrait
  cover_image_url text,
  display_order   integer not null default 0,
  published       boolean not null default true
);

create index if not exists publications_order_idx
  on public.publications (published, display_order, published_date desc);

create trigger publications_set_updated_at
  before update on public.publications
  for each row execute function public.set_updated_at();

alter table public.publications enable row level security;

-- Lecture publique des publications publiées (pour le site), gestion admin.
create policy "publications_public_read"
  on public.publications for select
  using (published = true);

create policy "publications_admin_all"
  on public.publications for all
  to authenticated using (true) with check (true);
