import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FAILS = 8;
const LOCK_MINUTES = 15;

/** Minutes restantes de blocage pour cette IP, ou null si pas bloquée. */
export async function minutesLocked(ip: string): Promise<number | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("login_attempts")
    .select("locked_until")
    .eq("ip", ip)
    .maybeSingle();

  if (data?.locked_until) {
    const remaining = new Date(data.locked_until).getTime() - Date.now();
    if (remaining > 0) return Math.ceil(remaining / 60000);
  }
  return null;
}

/** Enregistre un échec ; bloque l'IP au-delà du seuil. */
export async function registerFail(ip: string): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("login_attempts")
    .select("fails")
    .eq("ip", ip)
    .maybeSingle();

  const fails = (data?.fails ?? 0) + 1;
  const lockedUntil =
    fails >= MAX_FAILS
      ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString()
      : null;

  await supabase.from("login_attempts").upsert({
    ip,
    fails: lockedUntil ? 0 : fails,
    locked_until: lockedUntil,
    updated_at: new Date().toISOString(),
  });
}

/** Réinitialise les tentatives (connexion réussie). */
export async function clearFails(ip: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("login_attempts").delete().eq("ip", ip);
}
