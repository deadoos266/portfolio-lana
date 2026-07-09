"use client";

import { useState } from "react";
import { RichTextArea } from "@/components/RichTextArea";
import { SectionGalleryEditor } from "./SectionGalleryEditor";
import { SectionGalleryUploader } from "./SectionGalleryUploader";
import { VideoUploader } from "./VideoUploader";

export interface SectionItem {
  id: string;
  label: string;
  content: string;
  gallery_urls?: string[];
  video_url?: string | null;
}

interface SectionsEditorProps {
  cardId: string;
  name: string;
  initialSections: SectionItem[];
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Éditeur de rubriques nommées pour une carte du parcours (ex : les 7
 * concours d'entrée). Chaque rubrique a un nom + un texte enrichi + ses
 * propres images, et s'affichera comme une section ancrée avec sa propre
 * entrée dans une petite navigation, à la manière des 3 grandes sections
 * de l'accueil.
 */
export function SectionsEditor({ cardId, name, initialSections }: SectionsEditorProps) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);

  function addSection() {
    setSections((prev) => [
      ...prev,
      { id: randomId(), label: "", content: "", gallery_urls: [], video_url: null },
    ]);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(sections.map((s) => s.id))}
      />

      {sections.map((section, i) => (
        <div
          key={section.id}
          className="space-y-3 rounded-xl border border-zinc-100 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Rubrique {i + 1}
            </span>
            <input
              defaultValue={section.label}
              name={`section_label__${section.id}`}
              placeholder="Nom de la rubrique (ex : IJBA)"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => removeSection(section.id)}
              className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
          <RichTextArea
            name={`section_content__${section.id}`}
            defaultValue={section.content}
            placeholder="Texte de cette rubrique…"
            minHeight={160}
          />

          <div className="space-y-2 border-t border-zinc-100 pt-3">
            <label className="text-sm font-medium text-zinc-700">
              Images de cette rubrique
            </label>
            <SectionGalleryEditor
              cardId={cardId}
              sectionId={section.id}
              images={section.gallery_urls ?? []}
            />
            <SectionGalleryUploader cardId={cardId} sectionId={section.id} />
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-3">
            <label className="text-sm font-medium text-zinc-700">
              Vidéo de cette rubrique
            </label>
            <VideoUploader
              cardId={cardId}
              sectionId={section.id}
              initialVideoUrl={section.video_url ?? null}
            />
          </div>
        </div>
      ))}

      <button type="button" onClick={addSection} className="btn-ghost text-sm">
        + Ajouter une rubrique
      </button>
    </div>
  );
}
