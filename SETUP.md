# Portfolio Lana — Setup

Portfolio personnel construit avec **Next.js 16** (App Router), **Tailwind v4**,
**Supabase** (base de données, auth, stockage d'images) et déployé sur **Vercel**.

## Stack & fonctionnalités prévues

- 🎨 Galerie / projets gérés depuis un CMS (table `projects`)
- 🖼️ Stockage des images dans Supabase Storage (bucket `portfolio`)
- ✉️ Formulaire de contact (table `contact_messages`)
- 🔐 Espace admin privé pour que Lana édite son contenu (Supabase Auth)
- 📊 Analytics simples des visites (table `page_visits`)

## Démarrage local

```bash
npm install
cp .env.local.example .env.local   # puis remplir les valeurs Supabase
npm run dev                         # http://localhost:3000
```

## Structure

```
src/
  app/                  # pages (App Router)
  lib/supabase/
    client.ts           # client Supabase navigateur
    server.ts           # client Supabase serveur (cookies)
    middleware.ts       # refresh de session
  middleware.ts         # branche le refresh sur toutes les routes
supabase/
  migrations/           # schéma SQL versionné
```

## Connexions externes (à faire une fois)

> Ces étapes nécessitent une connexion navigateur — voir le récap fourni
> dans le chat. Statut :

- [ ] **GitHub** — repo créé et code poussé
- [ ] **Vercel** — projet lié, variables d'env configurées, déployé
- [ ] **Supabase** — projet créé, schéma appliqué (`supabase db push`)

## Variables d'environnement

Voir `.env.local.example`. À renseigner aussi dans Vercel
(Project Settings > Environment Variables) pour la prod.

| Variable | Où la trouver |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API (secret) |
| `NEXT_PUBLIC_SITE_URL` | URL de prod (ex: https://lana.vercel.app) |
