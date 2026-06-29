// Alphabet sans caractères ambigus (pas de 0/O/1/l/i).
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/**
 * Génère un code court aléatoire pour les liens traqués.
 * 7 caractères sur 31 symboles ≈ 27 milliards de combinaisons : collision
 * extrêmement improbable à l'échelle d'une recherche d'alternance.
 */
export function generateSlug(length = 7): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/**
 * Normalise une URL de destination : ajoute https:// si le protocole manque.
 * Renvoie null si l'entrée n'est pas une URL exploitable.
 */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}
