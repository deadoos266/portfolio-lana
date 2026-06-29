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
