import { getSetting, setSetting } from "@/lib/settings";

/**
 * Palette de couleurs modifiable par Lana depuis le dashboard.
 * Toute nouvelle partie du site DOIT s'appuyer sur ces variables plutôt
 * que sur des couleurs codées en dur, pour rester modifiable.
 */
export interface SiteTheme {
  // Textes
  textTitles: string; // Grands titres des sections (Mon projet, Ma vision, Mon parcours)
  textContactTitle: string; // Titre "Contact" en bas de page
  textName: string; // Nom "Lana Hervé" sous la banderole
  textBody: string; // Corps des paragraphes

  // Accents
  accentWarm: string; // Accent chaud (label Carte & synopsis, boutons doux)
  accentCool: string; // Accent froid (détails bleus)

  // Fonds
  bgMain: string; // Fond principal du site
  bgHero: string; // Fond du bandeau PORTFOLIO
  haloWarm: string; // Halo/gradient chaud (rose)
  haloCool: string; // Halo/gradient froid (bleu)

  // Boutons
  buttonBg: string; // Fond des boutons principaux
  buttonText: string; // Texte des boutons principaux
}

/** Palette par défaut (couleurs actuelles du site). */
export const DEFAULT_THEME: SiteTheme = {
  textTitles: "#8A9A5B", // vert olive doux
  textContactTitle: "#1D1D1F", // noir doux
  textName: "#F472B6", // rose pastel (pink-400)
  textBody: "#3F3F46", // zinc-700
  accentWarm: "#F472B6", // rose (pink-400)
  accentCool: "#7DD3FC", // bleu ciel (sky-300)
  bgMain: "#FFFFFF", // blanc
  bgHero: "#FAFAF9", // stone-50
  haloWarm: "#FCE7F3", // rose très pâle (pink-100)
  haloCool: "#E0F2FE", // bleu très pâle (sky-100)
  buttonBg: "#1D1D1F", // noir doux
  buttonText: "#FFFFFF", // blanc
};

const THEME_KEY = "site_theme_v1";

/** Charge la palette actuelle (les valeurs manquantes retombent sur les défauts). */
export async function getTheme(): Promise<SiteTheme> {
  const raw = await getSetting(THEME_KEY);
  if (!raw) return DEFAULT_THEME;
  try {
    const parsed = JSON.parse(raw) as Partial<SiteTheme>;
    return { ...DEFAULT_THEME, ...parsed };
  } catch {
    return DEFAULT_THEME;
  }
}

/** Enregistre la palette. */
export async function saveTheme(theme: SiteTheme): Promise<void> {
  await setSetting(THEME_KEY, JSON.stringify(theme));
}

/** Génère le bloc CSS `:root { --c-*: ...; }` à injecter dans la page. */
export function themeToCssVariables(theme: SiteTheme): string {
  return `:root {
  --c-text-titles: ${theme.textTitles};
  --c-text-contact-title: ${theme.textContactTitle};
  --c-text-name: ${theme.textName};
  --c-text-body: ${theme.textBody};
  --c-accent-warm: ${theme.accentWarm};
  --c-accent-cool: ${theme.accentCool};
  --c-bg-main: ${theme.bgMain};
  --c-bg-hero: ${theme.bgHero};
  --c-halo-warm: ${theme.haloWarm};
  --c-halo-cool: ${theme.haloCool};
  --c-button-bg: ${theme.buttonBg};
  --c-button-text: ${theme.buttonText};
}`;
}

/** Métadonnées d'un pinceau (pour l'interface de sélection). */
export interface SwatchInfo {
  key: keyof SiteTheme;
  label: string;
  group: "Textes" | "Accents" | "Fonds" | "Boutons";
  description: string;
}

/**
 * Nuances suggérées pour chaque pinceau — affichées comme boutons cliquables
 * dans le dashboard. Choisies pour être adaptées au rôle de chaque pinceau.
 */
export const SUGGESTIONS: Record<keyof SiteTheme, ReadonlyArray<string>> = {
  textTitles: [
    "#8A9A5B", "#6B7C3B", "#94A165", "#4A5D23",
    "#F472B6", "#EC4899", "#A855F7", "#1D1D1F",
  ],
  textContactTitle: [
    "#1D1D1F", "#27272A", "#52525B", "#71717A",
    "#8A9A5B", "#F472B6", "#3B82F6", "#A16207",
  ],
  textName: [
    "#F472B6", "#F9A8D4", "#EC4899", "#FB7185",
    "#8A9A5B", "#7DD3FC", "#FBBF24", "#1D1D1F",
  ],
  textBody: [
    "#3F3F46", "#27272A", "#52525B", "#1D1D1F",
    "#71717A", "#18181B", "#4A5D23", "#7C2D12",
  ],
  accentWarm: [
    "#F472B6", "#F9A8D4", "#FB7185", "#EC4899",
    "#FDA4AF", "#F97316", "#FBBF24", "#DC2626",
  ],
  accentCool: [
    "#7DD3FC", "#A5F3FC", "#93C5FD", "#C4B5FD",
    "#6EE7B7", "#86EFAC", "#A3E635", "#67E8F9",
  ],
  bgMain: [
    "#FFFFFF", "#FBF9F4", "#FAF7F0", "#F8F4E9",
    "#FCFCFA", "#F5F0E1", "#FFF8DC", "#F0F2F0",
  ],
  bgHero: [
    "#FAFAF9", "#F5F5F4", "#FBF9F4", "#E7E5E4",
    "#F0F0F0", "#1D1D1F", "#F8F4E9", "#FFFFFF",
  ],
  haloWarm: [
    "#FCE7F3", "#FBCFE8", "#FED7AA", "#FEF3C7",
    "#F9A8D4", "#FECACA", "#FFE4E6", "#FEF6E4",
  ],
  haloCool: [
    "#E0F2FE", "#BAE6FD", "#DBEAFE", "#DDD6FE",
    "#D1FAE5", "#ECFDF5", "#E0E7FF", "#F0F9FF",
  ],
  buttonBg: [
    "#1D1D1F", "#000000", "#27272A", "#F472B6",
    "#3B82F6", "#8A9A5B", "#7C3AED", "#DC2626",
  ],
  buttonText: [
    "#FFFFFF", "#FBF9F4", "#1D1D1F", "#F5F5F4",
    "#FCE7F3", "#E0F2FE", "#FEF3C7", "#000000",
  ],
};

/** Liste des pinceaux affichés dans le dashboard, dans l'ordre. */
export const SWATCHES: ReadonlyArray<SwatchInfo> = [
  { group: "Textes", key: "textTitles", label: "Grands titres", description: "Mon projet, Ma vision, Mon parcours" },
  { group: "Textes", key: "textContactTitle", label: "Titre Contact", description: "Le petit titre italique en bas" },
  { group: "Textes", key: "textName", label: "Nom « Lana Hervé »", description: "Sous la banderole PORTFOLIO" },
  { group: "Textes", key: "textBody", label: "Texte principal", description: "Corps des paragraphes" },
  { group: "Accents", key: "accentWarm", label: "Accent chaud", description: "Label « Carte & synopsis », détails roses" },
  { group: "Accents", key: "accentCool", label: "Accent froid", description: "Détails bleus" },
  { group: "Fonds", key: "bgMain", label: "Fond du site", description: "Fond général de toutes les pages" },
  { group: "Fonds", key: "bgHero", label: "Fond du bandeau PORTFOLIO", description: "Zone tout en haut" },
  { group: "Fonds", key: "haloWarm", label: "Halo chaud", description: "Taches de couleur chaudes en fond" },
  { group: "Fonds", key: "haloCool", label: "Halo froid", description: "Taches de couleur froides en fond" },
  { group: "Boutons", key: "buttonBg", label: "Fond des boutons", description: "Bouton « Me contacter »" },
  { group: "Boutons", key: "buttonText", label: "Texte des boutons", description: "Écriture sur les boutons" },
];
