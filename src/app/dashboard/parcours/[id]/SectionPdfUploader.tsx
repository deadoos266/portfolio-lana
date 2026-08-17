"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSectionPdfUploadUrl, saveSectionPdf } from "../actions";
import { fileDisplayName } from "@/lib/file-type";

interface SectionPdfUploaderProps {
  cardId: string;
  sectionId: string;
  initialPdfUrl: string | null;
}

/**
 * PDF rattaché à une rubrique (ex : la version PDF de l'article dont les
 * pages sont dans le carrousel juste au-dessus). Upload direct navigateur
 * vers Storage, donc aucune limite de taille.
 */
export function SectionPdfUploader({
  cardId,
  sectionId,
  initialPdfUrl,
}: SectionPdfUploaderProps) {
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const prepared = await createSectionPdfUploadUrl(file.name);
      if ("error" in prepared) throw new Error(prepared.error);
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("portfolio")
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType: file.type || "application/pdf",
        });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("portfolio").getPublicUrl(prepared.path);
      await saveSectionPdf(cardId, sectionId, data.publicUrl);
      setPdfUrl(data.publicUrl);
    } catch {
      setError("L’envoi a échoué. Réessaie.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Retirer ce PDF ?")) return;
    await saveSectionPdf(cardId, sectionId, null);
    setPdfUrl(null);
  }

  return (
    <div className="space-y-1.5">
      {pdfUrl ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white p-2">
          <span aria-hidden className="text-lg">📄</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
          >
            {fileDisplayName(pdfUrl)}
          </a>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700"
          >
            Retirer
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="input"
        />
      )}
      {uploading && <p className="text-xs text-zinc-500">Envoi en cours…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
