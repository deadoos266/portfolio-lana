"use client";

import { useState } from "react";
import { RichTextArea } from "@/components/RichTextArea";

export interface SectionItem {
  id: string;
  label: string;
  content: string;
}

interface SectionsEditorProps {
  name: string;
  initialSections: SectionItem[];
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Éditeur de rubriques nommées pour une carte du parcours (ex : les 7
 * concours d'entrée). Chaque rubrique a un nom + un texte enrichi, et
 * s'affichera comme une section ancrée avec sa propre entrée dans une
 * petite navigation, à la manière des 3 grandes sections de l'accueil.
 */
export function SectionsEditor({ name, initialSections }: SectionsEditorProps) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);

  function addSection() {
    setSections((prev) => [...prev, { id: randomId(), label: "", content: "" }]);
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
        </div>
      ))}

      <button type="button" onClick={addSection} className="btn-ghost text-sm">
        + Ajouter une rubrique
      </button>
    </div>
  );
}
