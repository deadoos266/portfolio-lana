"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSectionVideoUploadUrl, saveSectionVideo } from "../actions";

interface VideoUploaderProps {
  cardId: string;
  sectionId: string;
  initialVideoUrl: string | null;
}

/**
 * Upload direct navigateur → Supabase Storage (via URL signée) : le fichier
 * vidéo ne transite jamais par nos Server Actions, donc aucune limite de
 * taille Vercel/Next.js ne s'applique. Sauvegarde indépendante du formulaire
 * principal — pas besoin de cliquer sur "Enregistrer" pour que ça prenne effet.
 */
export function VideoUploader({
  cardId,
  sectionId,
  initialVideoUrl,
}: VideoUploaderProps) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const prepared = await createSectionVideoUploadUrl(file.name);
      if ("error" in prepared) throw new Error(prepared.error);

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType: file.type || "video/mp4",
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("portfolio").getPublicUrl(prepared.path);
      await saveSectionVideo(cardId, sectionId, data.publicUrl);
      setVideoUrl(data.publicUrl);
    } catch {
      setError("L'envoi a échoué. Vérifie ta connexion et réessaie.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Supprimer cette vidéo ?")) return;
    await saveSectionVideo(cardId, sectionId, null);
    setVideoUrl(null);
  }

  return (
    <div className="space-y-2">
      {videoUrl ? (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full max-w-sm rounded-lg border border-black/10"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-red-500 hover:text-red-700"
          >
            Supprimer la vidéo
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="input"
          />
          {uploading && (
            <p className="text-xs text-zinc-500">Envoi en cours…</p>
          )}
        </>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
