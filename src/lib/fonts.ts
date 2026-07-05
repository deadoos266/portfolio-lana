import { getSetting, setSetting } from "@/lib/settings";

/**
 * Bibliothèque de polices proposées à Lana. Chaque entrée liste :
 * - `slug` : identifiant technique unique
 * - `name` : nom lisible affiché dans le dashboard
 * - `family` : la valeur CSS `font-family` (avec fallback système)
 * - `googleName` : le nom exact chez Google Fonts (null pour les polices système)
 * - `weights` : les graisses à précharger
 * - `category` : famille pour regrouper l'affichage
 */
export interface FontDef {
  slug: string;
  name: string;
  family: string;
  googleName: string | null;
  weights: ReadonlyArray<number>;
  category: FontCategory;
}

export type FontCategory =
  | "Serif classique"
  | "Serif display"
  | "Sans-serif"
  | "Manuscrite"
  | "Display / Impact"
  | "Machine à écrire";

export const FONT_LIBRARY: ReadonlyArray<FontDef> = [
  // Serif classique
  { slug: "times", name: "Times New Roman", family: '"Times New Roman", Times, serif', googleName: null, weights: [400, 700], category: "Serif classique" },
  { slug: "playfair", name: "Playfair Display", family: '"Playfair Display", serif', googleName: "Playfair Display", weights: [400, 600, 700], category: "Serif classique" },
  { slug: "cormorant", name: "Cormorant Garamond", family: '"Cormorant Garamond", serif', googleName: "Cormorant Garamond", weights: [400, 500, 700], category: "Serif classique" },
  { slug: "merriweather", name: "Merriweather", family: '"Merriweather", serif', googleName: "Merriweather", weights: [400, 700], category: "Serif classique" },
  { slug: "lora", name: "Lora", family: '"Lora", serif', googleName: "Lora", weights: [400, 600, 700], category: "Serif classique" },
  { slug: "eb-garamond", name: "EB Garamond", family: '"EB Garamond", serif', googleName: "EB Garamond", weights: [400, 500, 700], category: "Serif classique" },
  { slug: "libre-baskerville", name: "Libre Baskerville", family: '"Libre Baskerville", serif', googleName: "Libre Baskerville", weights: [400, 700], category: "Serif classique" },
  { slug: "pt-serif", name: "PT Serif", family: '"PT Serif", serif', googleName: "PT Serif", weights: [400, 700], category: "Serif classique" },

  // Serif display
  { slug: "fraunces", name: "Fraunces", family: '"Fraunces", serif', googleName: "Fraunces", weights: [400, 500, 600, 700], category: "Serif display" },
  { slug: "dm-serif-display", name: "DM Serif Display", family: '"DM Serif Display", serif', googleName: "DM Serif Display", weights: [400], category: "Serif display" },
  { slug: "abril-fatface", name: "Abril Fatface", family: '"Abril Fatface", serif', googleName: "Abril Fatface", weights: [400], category: "Serif display" },
  { slug: "yeseva-one", name: "Yeseva One", family: '"Yeseva One", serif', googleName: "Yeseva One", weights: [400], category: "Serif display" },

  // Sans-serif
  { slug: "inter", name: "Inter", family: '"Inter", sans-serif', googleName: "Inter", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "poppins", name: "Poppins", family: '"Poppins", sans-serif', googleName: "Poppins", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "montserrat", name: "Montserrat", family: '"Montserrat", sans-serif', googleName: "Montserrat", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "raleway", name: "Raleway", family: '"Raleway", sans-serif', googleName: "Raleway", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "work-sans", name: "Work Sans", family: '"Work Sans", sans-serif', googleName: "Work Sans", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "space-grotesk", name: "Space Grotesk", family: '"Space Grotesk", sans-serif', googleName: "Space Grotesk", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "manrope", name: "Manrope", family: '"Manrope", sans-serif', googleName: "Manrope", weights: [400, 500, 600, 700], category: "Sans-serif" },
  { slug: "geist", name: "Geist", family: 'var(--font-geist-sans), sans-serif', googleName: null, weights: [400, 500, 600, 700], category: "Sans-serif" },

  // Manuscrite
  { slug: "caveat", name: "Caveat", family: '"Caveat", cursive', googleName: "Caveat", weights: [400, 700], category: "Manuscrite" },
  { slug: "dancing-script", name: "Dancing Script", family: '"Dancing Script", cursive', googleName: "Dancing Script", weights: [400, 700], category: "Manuscrite" },
  { slug: "kalam", name: "Kalam", family: '"Kalam", cursive', googleName: "Kalam", weights: [400, 700], category: "Manuscrite" },
  { slug: "sacramento", name: "Sacramento", family: '"Sacramento", cursive', googleName: "Sacramento", weights: [400], category: "Manuscrite" },
  { slug: "amatic-sc", name: "Amatic SC", family: '"Amatic SC", cursive', googleName: "Amatic SC", weights: [400, 700], category: "Manuscrite" },
  { slug: "homemade-apple", name: "Homemade Apple", family: '"Homemade Apple", cursive', googleName: "Homemade Apple", weights: [400], category: "Manuscrite" },
  { slug: "pacifico", name: "Pacifico", family: '"Pacifico", cursive', googleName: "Pacifico", weights: [400], category: "Manuscrite" },

  // Display / Impact
  { slug: "bebas-neue", name: "Bebas Neue", family: '"Bebas Neue", sans-serif', googleName: "Bebas Neue", weights: [400], category: "Display / Impact" },
  { slug: "anton", name: "Anton", family: '"Anton", sans-serif', googleName: "Anton", weights: [400], category: "Display / Impact" },
  { slug: "oswald", name: "Oswald", family: '"Oswald", sans-serif', googleName: "Oswald", weights: [400, 500, 600, 700], category: "Display / Impact" },

  // Machine à écrire
  { slug: "courier-prime", name: "Courier Prime", family: '"Courier Prime", monospace', googleName: "Courier Prime", weights: [400, 700], category: "Machine à écrire" },
  { slug: "special-elite", name: "Special Elite", family: '"Special Elite", monospace', googleName: "Special Elite", weights: [400], category: "Machine à écrire" },
  { slug: "cutive-mono", name: "Cutive Mono", family: '"Cutive Mono", monospace', googleName: "Cutive Mono", weights: [400], category: "Machine à écrire" },
];

const FONT_BY_SLUG: Record<string, FontDef> = Object.fromEntries(
  FONT_LIBRARY.map((f) => [f.slug, f]),
);

export function getFont(slug: string): FontDef {
  return FONT_BY_SLUG[slug] ?? FONT_BY_SLUG["times"];
}

/**
 * Emplacements typographiques du site — chacun peut recevoir sa propre police.
 * Comme pour la palette de couleurs, toute nouvelle partie du site DOIT
 * s'appuyer sur `var(--font-<slot>)` plutôt que sur une police codée en dur.
 */
export interface SiteFonts {
  portfolio: string; // Titre "PORTFOLIO" (banderole)
  sectionTitles: string; // Grands titres roses/olive
  contactTitle: string; // Titre "Contact"
  name: string; // Nom "Lana Hervé"
  heroSubtitle: string; // Sous-titre sous PORTFOLIO
  nav: string; // Menu de navigation
  heroIntro: string; // Grande phrase d'intro
  body: string; // Corps de texte (projet, vision, pages parcours)
  cardTitle: string; // Titres des cartes carrousel
  cardDescription: string; // Description des cartes carrousel
}

export const DEFAULT_FONTS: SiteFonts = {
  portfolio: "fraunces",
  sectionTitles: "times",
  contactTitle: "times",
  name: "fraunces",
  heroSubtitle: "geist",
  nav: "geist",
  heroIntro: "fraunces",
  body: "times",
  cardTitle: "fraunces",
  cardDescription: "geist",
};

export interface FontSlotInfo {
  key: keyof SiteFonts;
  label: string;
  description: string;
  preview: string; // Texte utilisé pour la prévisualisation
}

export const FONT_SLOTS: ReadonlyArray<FontSlotInfo> = [
  { key: "portfolio", label: "Titre PORTFOLIO", description: "Banderole en haut de page", preview: "PORTFOLIO" },
  { key: "name", label: "Nom « Lana Hervé »", description: "Sous la banderole", preview: "Lana Hervé" },
  { key: "heroSubtitle", label: "Sous-titre du hero", description: "« Entrée en Master 1… »", preview: "Entrée en Master 1 Journalisme" },
  { key: "nav", label: "Menu de navigation", description: "Mon projet / Ma vision / Mon parcours (barre du haut)", preview: "Mon projet professionnel" },
  { key: "heroIntro", label: "Texte de présentation", description: "Grande phrase à droite des photos", preview: "Curieuse et passionnée par les histoires…" },
  { key: "sectionTitles", label: "Grands titres de section", description: "Mon projet, Ma vision, Mon parcours (roses/olive)", preview: "Ma vision du journalisme" },
  { key: "body", label: "Corps du texte", description: "Paragraphes de projet, vision, pages parcours", preview: "Mon projet professionnel se construit autour d'une conviction." },
  { key: "cardTitle", label: "Titres des cartes du carrousel", description: "Stage « Mouvement », Articles, etc.", preview: "Stage « Mouvement »" },
  { key: "cardDescription", label: "Petit texte des cartes", description: "Description sous chaque titre de carte", preview: "Une phrase courte pour donner envie de cliquer." },
  { key: "contactTitle", label: "Titre « Contact »", description: "Titre italique en bas de page", preview: "Contact" },
];

const FONTS_KEY = "site_fonts_v1";

export async function getFonts(): Promise<SiteFonts> {
  const raw = await getSetting(FONTS_KEY);
  if (!raw) return DEFAULT_FONTS;
  try {
    const parsed = JSON.parse(raw) as Partial<SiteFonts>;
    return { ...DEFAULT_FONTS, ...parsed };
  } catch {
    return DEFAULT_FONTS;
  }
}

export async function saveFonts(fonts: SiteFonts): Promise<void> {
  await setSetting(FONTS_KEY, JSON.stringify(fonts));
}

/** Génère le bloc CSS `:root { --font-*: ...; }`. */
export function fontsToCssVariables(fonts: SiteFonts): string {
  const lines = FONT_SLOTS.map((slot) => {
    const font = getFont(fonts[slot.key]);
    return `  --font-${slot.key}: ${font.family};`;
  });
  return `:root {\n${lines.join("\n")}\n}`;
}

/**
 * Construit l'URL Google Fonts pour charger uniquement les polices utilisées
 * (une seule requête, chargement optimisé).
 */
export function googleFontsUrl(fonts: SiteFonts): string | null {
  const uniqueSlugs = new Set(Object.values(fonts));
  const families: string[] = [];
  for (const slug of uniqueSlugs) {
    const font = getFont(slug);
    if (!font.googleName) continue;
    const name = font.googleName.replace(/ /g, "+");
    const weights = font.weights.join(";");
    families.push(`family=${name}:wght@${weights}`);
  }
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
