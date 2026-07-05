"use server";

import { revalidatePath } from "next/cache";
import {
  DEFAULT_FONTS,
  FONT_SLOTS,
  saveFonts,
  type SiteFonts,
} from "@/lib/fonts";

function readSlug(formData: FormData, key: string, fallback: string): string {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

/** Enregistre les polices depuis le formulaire du dashboard. */
export async function saveFontsAction(formData: FormData): Promise<void> {
  const next: SiteFonts = { ...DEFAULT_FONTS };
  for (const slot of FONT_SLOTS) {
    next[slot.key] = readSlug(formData, slot.key, DEFAULT_FONTS[slot.key]);
  }
  await saveFonts(next);
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/polices");
}

/** Remet toutes les polices à leurs valeurs par défaut. */
export async function resetFontsAction(): Promise<void> {
  await saveFonts(DEFAULT_FONTS);
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/polices");
}
