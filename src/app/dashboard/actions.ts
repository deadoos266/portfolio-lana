"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug, normalizeUrl } from "@/lib/slug";
import { isApplicationStatus } from "@/lib/types";

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

  const supabase = await createClient();

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
  supabase: Awaited<ReturnType<typeof createClient>>,
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
  const supabase = await createClient();
  await supabase.from("applications").update({ status }).eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/a/${id}`);
}

export async function deleteApplication(id: string) {
  const supabase = await createClient();
  await supabase.from("applications").delete().eq("id", id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
