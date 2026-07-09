"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/storage";
import { normalizeUrl } from "@/lib/slug";
import { setSetting } from "@/lib/settings";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

interface SectionItem {
  id: string;
  label: string;
  content: string;
  gallery_urls?: string[];
}

interface UpdatePayload {
  title: string;
  description: string | null;
  content: string | null;
  image_url?: string;
  gallery_urls?: string[];
  image_aspect?: "square" | "landscape" | "portrait";
  image_zoom?: number;
  image_pos_x?: number;
  image_pos_y?: number;
  article_urls?: string[];
  sections?: SectionItem[];
}

/**
 * Reconstruit la liste des rubriques nommées depuis le formulaire :
 * `section_ids` porte l'ordre (JSON), chaque rubrique a ses propres champs
 * `section_label__<id>` / `section_content__<id>` / `section_gallery__<id>`
 * (voir SectionsEditor). Les nouvelles images sont uploadées et fusionnées
 * avec la galerie existante de chaque rubrique (on n'écrase pas).
 */
async function parseSections(
  supabase: ReturnType<typeof createAdminClient>,
  cardId: string,
  formData: FormData,
): Promise<SectionItem[]> {
  const rawIds = str(formData, "section_ids");
  if (!rawIds) return [];

  let ids: unknown;
  try {
    ids = JSON.parse(rawIds);
  } catch {
    return [];
  }
  if (!Array.isArray(ids)) return [];

  const { data: existing } = await supabase
    .from("parcours_cards")
    .select("sections")
    .eq("id", cardId)
    .maybeSingle();
  const existingById = new Map(
    ((existing?.sections as SectionItem[] | null) ?? []).map((s) => [s.id, s]),
  );

  const sections: SectionItem[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const label = str(formData, `section_label__${id}`);
    if (!label) continue;
    const content =
      (formData.get(`section_content__${id}`) as string | null)?.trim() ?? "";

    const previousGallery = existingById.get(id)?.gallery_urls ?? [];
    const newFiles = formData
      .getAll(`section_gallery__${id}`)
      .filter((v): v is File => v instanceof File && v.size > 0);
    const uploaded: string[] = [];
    for (const file of newFiles) {
      const url = await uploadFile(file, "parcours");
      if (url) uploaded.push(url);
    }

    sections.push({
      id,
      label,
      content,
      gallery_urls: [...previousGallery, ...uploaded],
    });
  }
  return sections;
}

function clampInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = value ? Number(value) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
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
  };

  // Format de l'image (carré / paysage / portrait)
  const aspect = str(formData, "image_aspect");
  if (aspect === "square" || aspect === "landscape" || aspect === "portrait") {
    updates.image_aspect = aspect;
  }

  // Cadrage (zoom + position)
  updates.image_zoom = clampInt(str(formData, "image_zoom"), 100, 100, 250);
  updates.image_pos_x = clampInt(str(formData, "image_pos_x"), 50, 0, 100);
  updates.image_pos_y = clampInt(str(formData, "image_pos_y"), 50, 0, 100);

  // Liens d'articles externes (une URL par ligne dans la textarea)
  const rawArticles = str(formData, "article_urls") ?? "";
  const articleUrls = rawArticles
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => normalizeUrl(line))
    .filter((line): line is string => line !== null);
  updates.article_urls = articleUrls;

  // Rubriques nommées (optionnel)
  updates.sections = await parseSections(supabase, id, formData);

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

  // Titre de la section articles + texte du bouton : réglages communs à
  // toutes les cartes (pas propres à celle-ci), édités ici par commodité
  // puisque c'est juste au-dessus des liens d'articles de cette carte.
  for (const key of ["article_section_title", "article_button_label"]) {
    const value = formData.get(key);
    if (typeof value === "string") {
      await setSetting(key, value.trim());
    }
  }

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

/** Supprime une image spécifique de la galerie d'une rubrique nommée. */
export async function removeSectionGalleryImage(
  cardId: string,
  sectionId: string,
  imageUrl: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("sections, slug")
    .eq("id", cardId)
    .maybeSingle();
  const sections: SectionItem[] = (data?.sections as SectionItem[] | null) ?? [];
  const next = sections.map((s) =>
    s.id === sectionId
      ? { ...s, gallery_urls: (s.gallery_urls ?? []).filter((u) => u !== imageUrl) }
      : s,
  );
  await supabase.from("parcours_cards").update({ sections: next }).eq("id", cardId);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  if (data?.slug) revalidatePath(`/parcours/${data.slug}`);
}
