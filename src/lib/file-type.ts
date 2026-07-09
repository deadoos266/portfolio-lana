/** Détecte si une URL de fichier pointe vers un PDF (vs une image). */
export function isPdf(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

/** Nom de fichier lisible à partir d'une URL Supabase Storage. */
export function fileDisplayName(url: string): string {
  try {
    const last = new URL(url).pathname.split("/").pop() ?? "document.pdf";
    // Les fichiers uploadés sont préfixés par un UUID ("<uuid>-nom.pdf") :
    // on le retire pour un affichage plus lisible.
    return decodeURIComponent(last.replace(/^[0-9a-f-]{36}-/i, ""));
  } catch {
    return "document.pdf";
  }
}
