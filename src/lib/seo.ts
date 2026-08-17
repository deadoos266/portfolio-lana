/** Outils pour les métadonnées de référencement (titres, descriptions). */

const MAX_DESCRIPTION = 160;

/**
 * Convertit du HTML enrichi en texte brut utilisable comme meta description :
 * balises retirées, entités décodées, espaces normalisés, coupé proprement
 * à la fin d'un mot.
 */
export function toPlainText(html: string | null | undefined, max = MAX_DESCRIPTION): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#3(?:9|4);/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/** Première description non vide parmi les candidates. */
export function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const v of values) {
    const t = toPlainText(v);
    if (t.length > 0) return t;
  }
  return "";
}
