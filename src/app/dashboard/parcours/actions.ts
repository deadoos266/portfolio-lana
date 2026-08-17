"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile, createSignedUpload } from "@/lib/storage";
import { normalizeUrl } from "@/lib/slug";
import { getSetting, setSetting } from "@/lib/settings";
import {
  documentsSettingKey,
  parseDocuments,
  type CardDocument,
} from "@/lib/card-documents";

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
  video_url?: string | null;
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
  gallery_layout?: string;
}

/**
 * Reconstruit la liste des rubriques nommées depuis le formulaire :
 * `section_ids` porte l'ordre (JSON), chaque rubrique a ses propres champs
 * `section_label__<id>` / `section_content__<id>` (voir SectionsEditor).
 * Images et vidéo sont gérées séparément (upload direct navigateur ->
 * Storage via URL signée) : on les préserve telles quelles ici pour ne
 * jamais les écraser en sauvegardant le reste du formulaire.
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

    sections.push({
      id,
      label,
      content,
      gallery_urls: existingById.get(id)?.gallery_urls ?? [],
      video_url: existingById.get(id)?.video_url ?? null,
    });
  }
  return sections;
}

/**
 * Applique les libellés saisis dans le formulaire aux documents existants.
 * Renvoie null s'il n'y a rien à mettre à jour (pour ne pas écraser la
 * colonne inutilement).
 */
async function renameDocuments(
  supabase: ReturnType<typeof createAdminClient>,
  cardId: string,
  formData: FormData,
): Promise<void> {
  const rawIds = str(formData, "document_ids");
  if (!rawIds) return;

  const { documents, slug } = await readDocuments(supabase, cardId);
  if (documents.length === 0 || !slug) return;

  const renamed = documents.map((doc) => {
    const label = str(formData, `document_label__${doc.id}`);
    return label ? { ...doc, label } : doc;
  });
  const changed = renamed.some((d, i) => d.label !== documents[i].label);
  if (changed) await writeDocuments(supabase, cardId, renamed, slug);
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

  // Image de couverture (remplace l'existante si nouvelle) — fichier unique,
  // reste petit, peut transiter par ce formulaire sans souci.
  const cover = formData.get("image");
  if (cover instanceof File && cover.size > 0) {
    const url = await uploadFile(cover, "parcours");
    if (url) updates.image_url = url;
  }

  // Note : la galerie (fichiers multiples, parfois volumineux) n'est PLUS
  // gérée ici — elle passe par GalleryUploader (upload direct navigateur ->
  // Storage via URL signée), pour ne jamais dépendre de la limite de taille
  // des Server Actions. Voir createGalleryUploadUrl / addGalleryFiles.

  const galleryLayout = str(formData, "gallery_layout");
  if (galleryLayout === "grid" || galleryLayout === "carousel") {
    updates.gallery_layout = galleryLayout;
  }

  // Libellés des documents PDF (l'ajout/suppression/ordre passe par des
  // actions dédiées ; ici on ne met à jour que les noms affichés).
  await renameDocuments(supabase, id, formData);

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

/**
 * Déplace un fichier de la galerie d'une position vers la gauche ou la
 * droite (échange simple avec son voisin). C'est cet ordre qui détermine
 * l'ordre de défilement du carrousel sur la page publique.
 */
export async function moveGalleryImage(
  id: string,
  imageUrl: string,
  direction: "left" | "right",
): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("gallery_urls, slug")
    .eq("id", id)
    .maybeSingle();
  const gallery: string[] = (data?.gallery_urls as string[]) ?? [];
  const from = gallery.indexOf(imageUrl);
  if (from === -1) return;
  const to = direction === "left" ? from - 1 : from + 1;
  if (to < 0 || to >= gallery.length) return;

  const next = [...gallery];
  [next[from], next[to]] = [next[to], next[from]];

  await supabase.from("parcours_cards").update({ gallery_urls: next }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  if (data?.slug) revalidatePath(`/parcours/${data.slug}`);
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

/**
 * Prépare l'envoi direct d'une vidéo depuis le navigateur vers Supabase
 * Storage (contourne la limite de taille des Server Actions). Le client
 * utilise ensuite le token pour uploader le fichier lui-même.
 */
export async function createSectionVideoUploadUrl(
  fileName: string,
): Promise<{ path: string; token: string } | { error: string }> {
  return createSignedUpload(fileName, "parcours");
}

/**
 * Prépare l'envoi direct d'un fichier de galerie (carte) depuis le
 * navigateur vers Supabase Storage — même principe que la vidéo : évite
 * la limite de taille des Server Actions quand plusieurs fichiers (images
 * et/ou PDF) sont envoyés en une fois.
 */
export async function createGalleryUploadUrl(
  fileName: string,
): Promise<{ path: string; token: string } | { error: string }> {
  return createSignedUpload(fileName, "parcours");
}

/** Ajoute des fichiers déjà uploadés à la galerie d'une carte (fusionne, n'écrase pas). */
export async function addGalleryFiles(
  cardId: string,
  fileUrls: string[],
): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("gallery_urls, slug")
    .eq("id", cardId)
    .maybeSingle();
  const previous: string[] = (data?.gallery_urls as string[]) ?? [];
  const next = [...previous, ...fileUrls];
  await supabase.from("parcours_cards").update({ gallery_urls: next }).eq("id", cardId);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  if (data?.slug) revalidatePath(`/parcours/${data.slug}`);
}

/** Prépare l'envoi direct d'un document PDF rattaché à une carte. */
export async function createDocumentUploadUrl(
  fileName: string,
): Promise<{ path: string; token: string } | { error: string }> {
  return createSignedUpload(fileName, "documents");
}

/** Lit les documents d'une carte + son slug (pour revalider la bonne page). */
async function readDocuments(
  supabase: ReturnType<typeof createAdminClient>,
  cardId: string,
): Promise<{ documents: CardDocument[]; slug: string | null }> {
  const { data } = await supabase
    .from("parcours_cards")
    .select("slug")
    .eq("id", cardId)
    .maybeSingle();
  const slug = (data?.slug as string | null) ?? null;
  if (!slug) return { documents: [], slug: null };
  const raw = await getSetting(documentsSettingKey(slug));
  return { documents: parseDocuments(raw), slug };
}

async function writeDocuments(
  supabase: ReturnType<typeof createAdminClient>,
  cardId: string,
  documents: CardDocument[],
  slug: string | null,
): Promise<void> {
  if (!slug) return;
  await setSetting(documentsSettingKey(slug), JSON.stringify(documents));
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  revalidatePath(`/parcours/${slug}`);
}

/** Ajoute un document PDF déjà uploadé à une carte. */
export async function addCardDocument(
  cardId: string,
  label: string,
  url: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { documents, slug } = await readDocuments(supabase, cardId);
  const id = crypto.randomUUID().slice(0, 8);
  await writeDocuments(supabase, cardId, [...documents, { id, label, url }], slug);
}

/** Retire un document PDF d'une carte. */
export async function removeCardDocument(
  cardId: string,
  documentId: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { documents, slug } = await readDocuments(supabase, cardId);
  await writeDocuments(supabase, cardId, documents.filter((d) => d.id !== documentId), slug);
}

/** Déplace un document dans la liste (échange avec son voisin). */
export async function moveCardDocument(
  cardId: string,
  documentId: string,
  direction: "up" | "down",
): Promise<void> {
  const supabase = createAdminClient();
  const { documents, slug } = await readDocuments(supabase, cardId);
  const from = documents.findIndex((d) => d.id === documentId);
  if (from === -1) return;
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= documents.length) return;
  const next = [...documents];
  [next[from], next[to]] = [next[to], next[from]];
  await writeDocuments(supabase, cardId, next, slug);
}

/** Prépare l'envoi direct d'un fichier de galerie de rubrique nommée. */
export async function createSectionGalleryUploadUrl(
  fileName: string,
): Promise<{ path: string; token: string } | { error: string }> {
  return createSignedUpload(fileName, "parcours");
}

/** Ajoute des fichiers déjà uploadés à la galerie d'une rubrique nommée. */
export async function addSectionGalleryFiles(
  cardId: string,
  sectionId: string,
  fileUrls: string[],
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
      ? { ...s, gallery_urls: [...(s.gallery_urls ?? []), ...fileUrls] }
      : s,
  );
  await supabase.from("parcours_cards").update({ sections: next }).eq("id", cardId);
  revalidatePath("/");
  revalidatePath("/dashboard/parcours");
  if (data?.slug) revalidatePath(`/parcours/${data.slug}`);
}

/** Enregistre (ou retire, si null) l'URL de la vidéo d'une rubrique nommée. */
export async function saveSectionVideo(
  cardId: string,
  sectionId: string,
  videoUrl: string | null,
): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("sections, slug")
    .eq("id", cardId)
    .maybeSingle();
  const sections: SectionItem[] = (data?.sections as SectionItem[] | null) ?? [];
  const next = sections.map((s) =>
    s.id === sectionId ? { ...s, video_url: videoUrl } : s,
  );
  await supabase.from("parcours_cards").update({ sections: next }).eq("id", cardId);
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
