"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/storage";
import { normalizeUrl } from "@/lib/slug";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

interface UpdatePayload {
  title: string;
  description: string | null;
  content: string | null;
  link_url: string | null;
  image_url?: string;
  gallery_urls?: string[];
  image_aspect?: "square" | "landscape" | "portrait";
}

/** Met à jour une carte du parcours : infos + image de couverture + contenu + galerie. */
export async function updateParcoursCard(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const updates: UpdatePayload = {
    title: str(formData, "title") ?? "Sans titre",
    description: str(formData, "description"),
    content: formData.get("content") instanceof File
      ? null
      : (formData.get("content") as string | null)?.trim() || null,
    link_url: null,
  };

  const rawLink = str(formData, "link_url");
  updates.link_url = rawLink ? normalizeUrl(rawLink) : null;

  // Format de l'image (carré / paysage / portrait)
  const aspect = str(formData, "image_aspect");
  if (aspect === "square" || aspect === "landscape" || aspect === "portrait") {
    updates.image_aspect = aspect;
  }

  // Image de couverture (remplace l'existante si nouvelle)
  const cover = formData.get("image");
  if (cover instanceof File && cover.size > 0) {
    const url = await uploadFile(cover, "parcours");
    if (url) updates.image_url = url;
  }

  // Galerie : peut avoir plusieurs nouveaux fichiers (name="gallery")
  const galleryFiles = formData.getAll("gallery").filter(
    (v): v is File => v instanceof File && v.size > 0,
  );
  if (galleryFiles.length > 0) {
    // On merge avec la galerie existante (on n'écrase pas)
    const { data: existing } = await supabase
      .from("parcours_cards")
      .select("gallery_urls")
      .eq("id", id)
      .maybeSingle();
    const previous: string[] = (existing?.gallery_urls as string[]) ?? [];
    const uploaded: string[] = [];
    for (const file of galleryFiles) {
      const url = await uploadFile(file, "parcours");
      if (url) uploaded.push(url);
    }
    updates.gallery_urls = [...previous, ...uploaded];
  }

  await supabase.from("parcours_cards").update(updates).eq("id", id);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  const slug = str(formData, "slug");
  if (slug) revalidatePath(`/parcours/${slug}`);
  redirect(`/dashboard/parcours/${id}?saved=1`);
}

/** Supprime une image spécifique de la galerie d'une carte. */
export async function removeGalleryImage(
  id: string,
  imageUrl: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("gallery_urls, slug")
    .eq("id", id)
    .maybeSingle();
  const gallery: string[] = (data?.gallery_urls as string[]) ?? [];
  const next = gallery.filter((u) => u !== imageUrl);
  await supabase
    .from("parcours_cards")
    .update({ gallery_urls: next })
    .eq("id", id);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  if (data?.slug) revalidatePath(`/parcours/${data.slug}`);
}
