import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le navigateur (composants "use client").
 * Utilise la clé anon publique — sécurisé tant que les politiques RLS
 * sont en place côté base de données.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
