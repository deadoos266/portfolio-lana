"use server";

import { revalidatePath } from "next/cache";
import {
  DEFAULT_THEME,
  SWATCHES,
  saveTheme,
  type SiteTheme,
} from "@/lib/theme";

function readColor(formData: FormData, key: string, fallback: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}

/** Enregistre la palette complète depuis le formulaire du dashboard. */
export async function saveThemeAction(formData: FormData) {
  const next: SiteTheme = { ...DEFAULT_THEME };
  for (const swatch of SWATCHES) {
    next[swatch.key] = readColor(formData, swatch.key, DEFAULT_THEME[swatch.key]);
  }
  await saveTheme(next);
  // Rafraîchit toutes les pages qui utilisent le thème.
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/couleurs");
}

/** Remet toutes les couleurs à leurs valeurs par défaut. */
export async function resetThemeAction() {
  await saveTheme(DEFAULT_THEME);
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/couleurs");
}
