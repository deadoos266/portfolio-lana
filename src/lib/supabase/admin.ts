import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase "admin" (clé service_role) — UNIQUEMENT côté serveur.
 * Contourne les politiques RLS : à n'utiliser que dans des routes serveur de
 * confiance (ex: la redirection publique des liens traqués, qui doit lire un
 * lien et enregistrer l'ouverture sans session utilisateur).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
