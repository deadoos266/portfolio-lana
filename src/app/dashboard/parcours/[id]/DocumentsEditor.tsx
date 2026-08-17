"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createDocumentUploadUrl,
  addCardDocument,
  removeCardDocument,
  moveCardDocument,
} from "../actions";

import type { CardDocument } from "@/lib/card-documents";

interface DocumentsEditorProps {
  cardId: string;
  documents: CardDocument[];
}

/**
 * Documents PDF rattachés à la carte. Upload direct navigateur → Storage
 * (pas de limite de taille), et le libellé de chaque document est modifiable
 * avec le reste du formulaire (champ `document_label__<id>`).
 */
export function DocumentsEditor({ cardId, documents }: DocumentsEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      for (const file of files) {
        const prepared = await createDocumentUploadUrl(file.name);
        if ("error" in prepared) throw new Error(prepared.error);
        const { error: upErr } = await supabase.storage
          .from("portfolio")
          .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: file.type || "application/pdf",
          });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("portfolio").getPublicUrl(prepared.path);
        // Libellé de départ : le nom du fichier sans extension.
        const label = file.name.replace(/\.[^.]+$/, "");
        await addCardDocument(cardId, label, data.publicUrl);
      }
    } catch {
      setError("L’envoi a échoué. Réessaie.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="document_ids" value={JSON.stringify(documents.map((d) => d.id))} />

      {documents.length === 0 ? (
        <p className="text-xs italic text-zinc-400">Aucun document pour l’instant.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc, i) => (
            <li
              key={doc.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white p-2"
            >
              <span aria-hidden className="shrink-0 text-lg">📄</span>
              <input
                name={`document_label__${doc.id}`}
                defaultValue={doc.label}
                placeholder="Nom affiché du document"
                className="input flex-1"
              />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
              >
                Voir ↗
              </a>
              <button
                type="button"
                disabled={pending || i === 0}
                onClick={() => startTransition(() => { void moveCardDocument(cardId, doc.id, "up"); })}
                aria-label="Monter"
                className="shrink-0 rounded px-1.5 text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={pending || i === documents.length - 1}
                onClick={() => startTransition(() => { void moveCardDocument(cardId, doc.id, "down"); })}
                aria-label="Descendre"
                className="shrink-0 rounded px-1.5 text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
              >
                ▼
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm("Supprimer ce document ?")) return;
                  startTransition(() => { void removeCardDocument(cardId, doc.id); });
                }}
                aria-label="Supprimer le document"
                className="shrink-0 rounded px-1.5 text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-40"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        type="file"
        accept="application/pdf"
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
