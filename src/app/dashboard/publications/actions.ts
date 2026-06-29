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

function num(formData: FormData, key: string): number {
  const raw = str(formData, key);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

async function coverFrom(formData: FormData): Promise<string | null> {
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    return uploadFile(image, "publications");
  }
  return null;
}

interface PublicationFields {
  title: string;
  media_type: string;
  outlet: string | null;
  published_date: string | null;
  url: string | null;
  category: string | null;
  excerpt: string | null;
  display_order: number;
  published: boolean;
}

function readFields(formData: FormData): PublicationFields {
  const title = str(formData, "title");
  if (!title) throw new Error("Le titre est obligatoire.");
  const urlRaw = str(formData, "url");
  return {
    title,
    media_type: str(formData, "media_type") ?? "ecrit",
    outlet: str(formData, "outlet"),
    published_date: str(formData, "published_date"),
    url: urlRaw ? normalizeUrl(urlRaw) : null,
    category: str(formData, "category"),
    excerpt: str(formData, "excerpt"),
    display_order: num(formData, "display_order"),
    published: formData.get("published") !== null,
  };
}

export async function createPublication(formData: FormData) {
  const fields = readFields(formData);
  const cover = await coverFrom(formData);
  const supabase = createAdminClient();
  await supabase
    .from("publications")
    .insert({ ...fields, cover_image_url: cover });
  revalidatePath("/dashboard/publications");
  redirect("/dashboard/publications");
}

export async function updatePublication(id: string, formData: FormData) {
  const fields = readFields(formData);
  const cover = await coverFrom(formData);
  const supabase = createAdminClient();
  await supabase
    .from("publications")
    .update({ ...fields, ...(cover ? { cover_image_url: cover } : {}) })
    .eq("id", id);
  revalidatePath("/dashboard/publications");
  redirect("/dashboard/publications");
}

export async function deletePublication(id: string) {
  const supabase = createAdminClient();
  await supabase.from("publications").delete().eq("id", id);
  revalidatePath("/dashboard/publications");
  redirect("/dashboard/publications");
}
