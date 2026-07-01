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
