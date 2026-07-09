"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createGalleryUploadUrl, addGalleryFiles } from "../actions";

interface GalleryUploaderProps {
  cardId: string;
}

/**
 * Upload direct navigateur → Supabase Storage (via URL signée), un ou
 * plusieurs fichiers à la fois : ils ne transitent jamais par nos Server
 * Actions, donc la limite de taille (15 Mo au total) ne s'applique jamais,
 * même en envoyant plusieurs images/PDF volumineux d'un coup.
 */
export function GalleryUploader({ cardId }: GalleryUploaderProps) {
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
        const prepared = await createGalleryUploadUrl(file.name);
        if ("error" in prepared) throw new Error(prepared.error);
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: file.type || "application/octet-stream",
          });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("portfolio").getPublicUrl(prepared.path);
        uploadedUrls.push(data.publicUrl);
      }
      await addGalleryFiles(cardId, uploadedUrls);
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
        accept="image/*,application/pdf"
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
