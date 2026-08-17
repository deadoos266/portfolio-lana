/**
 * Documents PDF rattachés à une carte du parcours.
 *
 * Ils sont rangés dans la table `app_settings` (clé `card_documents_<slug>`)
 * plutôt que dans une colonne dédiée de `parcours_cards` : ça évite une
 * migration de schéma, pour un résultat identique côté visiteur.
 */
export interface CardDocument {
  id: string;
  label: string;
  url: string;
}

export function documentsSettingKey(slug: string): string {
  return `card_documents_${slug}`;
}

/** Parse une valeur de réglage en liste de documents (tolérant aux erreurs). */
export function parseDocuments(raw: string | null): CardDocument[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d): d is CardDocument =>
        typeof d?.id === "string" &&
        typeof d?.label === "string" &&
        typeof d?.url === "string",
    );
  } catch {
    return [];
  }
}
