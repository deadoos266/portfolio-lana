"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clearSession,
  verifyPin,
  setPin,
  isValidPinFormat,
} from "@/lib/auth";
import { generateSlug, normalizeUrl } from "@/lib/slug";
import { isApplicationStatus } from "@/lib/types";
import { uploadFile } from "@/lib/storage";
import { setSetting } from "@/lib/settings";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Crée une candidature et, si une destination est fournie, son lien traqué
 * unique. Réessaie en cas de collision (improbable) sur le slug.
 */
export async function createApplication(formData: FormData) {
  const companyName = str(formData, "company_name");
  if (!companyName) {
    throw new Error("Le nom de l'entreprise est obligatoire.");
  }

  const supabase = createAdminClient();

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      company_name: companyName,
      role: str(formData, "role"),
      contact_name: str(formData, "contact_name"),
      contact_email: str(formData, "contact_email"),
      notes: str(formData, "notes"),
      applied_at: str(formData, "applied_at"),
    })
    .select("id")
    .single();

  if (error || !application) {
    throw new Error("Impossible de créer la candidature.");
  }

  const destinationInput = str(formData, "destination_url");
  if (destinationInput) {
    const destination = normalizeUrl(destinationInput);
    if (!destination) {
      throw new Error("L'URL de destination n'est pas valide.");
    }
    await insertLinkWithRetry(supabase, {
      application_id: application.id,
      destination_url: destination,
      label: str(formData, "label"),
    });
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/a/${application.id}`);
}

interface LinkInput {
  application_id: string;
  destination_url: string;
  label: string | null;
}

async function insertLinkWithRetry(
  supabase: ReturnType<typeof createAdminClient>,
  input: LinkInput,
  attempts = 3,
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const { error } = await supabase
      .from("tracked_links")
      .insert({ ...input, slug: generateSlug() });
    if (!error) return;
    // 23505 = violation de contrainte unique (slug déjà pris) -> on réessaie
    if (error.code !== "23505") {
      throw new Error("Impossible de créer le lien traqué.");
    }
  }
  throw new Error("Génération du lien impossible, réessaie.");
}

export async function updateStatus(id: string, status: string) {
  if (!isApplicationStatus(status)) {
    throw new Error("Statut invalide.");
  }
  const supabase = createAdminClient();
  await supabase.from("applications").update({ status }).eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/a/${id}`);
}

export async function deleteApplication(id: string) {
  const supabase = createAdminClient();
  await supabase.from("applications").delete().eq("id", id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Supprime une ouverture/visite précise d'un lien traqué. */
export async function deleteOpen(id: string, applicationId: string) {
  const supabase = createAdminClient();
  await supabase.from("link_opens").delete().eq("id", id);
  revalidatePath(`/dashboard/a/${applicationId}`);
}

/** Supprime une visite du site. */
export async function deleteVisit(id: string) {
  const supabase = createAdminClient();
  await supabase.from("page_visits").delete().eq("id", id);
  revalidatePath("/dashboard/visites");
}

export interface ChangePinState {
  error: string;
  success: boolean;
}

/** Change le code d'accès du dashboard (après vérification du code actuel). */
export async function changePin(
  _prev: ChangePinState,
  formData: FormData,
): Promise<ChangePinState> {
  const current = String(formData.get("current") ?? "").trim();
  const next = String(formData.get("next") ?? "").trim();

  if (!(await verifyPin(current))) {
    return { error: "Code actuel incorrect.", success: false };
  }
  if (!isValidPinFormat(next)) {
    return { error: "Le nouveau code doit faire exactement 6 chiffres.", success: false };
  }

  await setPin(next);
  return { error: "", success: true };
}

/** Enregistre le contenu de la page d'accueil (photos, banderole, textes, contact). */
export async function saveSiteSettings(formData: FormData) {
  // Banderole "PORTFOLIO"
  const banner = formData.get("banner");
  if (banner instanceof File && banner.size > 0) {
    const url = await uploadFile(banner, "site");
    if (url) await setSetting("banner_url", url);
  }

  // Photomaton (une seule photo verticale longue)
  const photomaton = formData.get("photomaton");
  if (photomaton instanceof File && photomaton.size > 0) {
    const url = await uploadFile(photomaton, "profil");
    if (url) await setSetting("photomaton_url", url);
  }

  // Textes
  for (const key of [
    "hero_subtitle",
    "hero_intro",
    "projet_text",
    "vision_text",
    "contact_email",
    "contact_phone",
  ]) {
    const value = formData.get(key);
    if (typeof value === "string") {
      await setSetting(key, value.trim());
    }
  }

  revalidatePath("/");
  revalidatePath("/dashboard/mon-site");
  redirect("/dashboard/mon-site?saved=1");
}

/** Upload du CV (PDF) -> Supabase Storage, URL stockée dans les réglages. */
export async function uploadCv(formData: FormData) {
  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) return;
  const url = await uploadFile(file, "cv");
  if (url) {
    await setSetting("cv_url", url);
  }
  revalidatePath("/dashboard/parametres");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
