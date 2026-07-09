import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "portfolio";

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Envoie un fichier dans le bucket Supabase Storage et renvoie son URL
 * publique (ou null en cas d'échec / fichier vide). Côté serveur uniquement.
 * Le fichier transite par le Server Action (limite de taille configurée) —
 * adapté aux images, pas aux vidéos. Voir createSignedUpload() pour les
 * fichiers volumineux.
 */
export async function uploadFile(
  file: File,
  folder: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const supabase = createAdminClient();
  const path = `${folder}/${crypto.randomUUID()}-${safeName(file.name || "fichier")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return null;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Prépare un envoi direct navigateur → Supabase Storage (le fichier ne
 * transite jamais par nos Server Actions, donc aucune limite de taille
 * Vercel/Next.js ne s'applique). Le client utilise ensuite
 * `uploadToSignedUrl(path, token, file)` avec le client Supabase navigateur.
 */
export async function createSignedUpload(
  fileName: string,
  folder: string,
): Promise<{ path: string; token: string } | { error: string }> {
  const supabase = createAdminClient();
  const path = `${folder}/${crypto.randomUUID()}-${safeName(fileName || "fichier")}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return { error: "Impossible de préparer l'envoi." };
  return { path: data.path, token: data.token };
}

/** URL publique d'un fichier déjà présent dans le bucket. */
export function publicUrlFor(path: string): string {
  const supabase = createAdminClient();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
