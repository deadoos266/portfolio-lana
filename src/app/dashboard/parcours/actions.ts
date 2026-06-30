"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/storage";
import { normalizeUrl } from "@/lib/slug";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Met à jour une carte du parcours (titre/description/lien + image). */
export async function updateParcoursCard(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const updates: Record<string, string | null> = {
    title: str(formData, "title") ?? "Sans titre",
    description: str(formData, "description"),
  };

  const rawLink = str(formData, "link_url");
  updates.link_url = rawLink ? normalizeUrl(rawLink) : null;

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const url = await uploadFile(file, "parcours");
    if (url) updates.image_url = url;
  }

  await supabase.from("parcours_cards").update(updates).eq("id", id);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
}
