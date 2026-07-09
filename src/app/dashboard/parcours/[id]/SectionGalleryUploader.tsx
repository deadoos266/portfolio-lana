"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSectionGalleryUploadUrl, addSectionGalleryFiles } from "../actions";

interface SectionGalleryUploaderProps {
  cardId: string;
  sectionId: string;
}

/**
 * Upload direct navigateur → Supabase Storage (via URL signée) pour les
 * images d'une rubrique nommée — même principe que GalleryUploader, évite
 * la limite de taille des Server Actions.
 */
export function SectionGalleryUploader({
  cardId,
  sectionId,
}: SectionGalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const prepared = await createSectionGalleryUploadUrl(file.name);
        if ("error" in prepared) throw new Error(prepared.error);
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: file.type || "image/jpeg",
          });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("portfolio").getPublicUrl(prepared.path);
        uploadedUrls.push(data.publicUrl);
      }
      await addSectionGalleryFiles(cardId, sectionId, uploadedUrls);
    } catch {
      setError("L'envoi a échoué pour un ou plusieurs fichiers. Réessaie.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="input"
      />
      {uploading && <p className="text-xs text-zinc-500">Envoi en cours…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
