"use client";

import Image from "next/image";
import { useTransition } from "react";
import { removeSectionGalleryImage } from "../actions";

interface SectionGalleryEditorProps {
  cardId: string;
  sectionId: string;
  images: ReadonlyArray<string>;
}

export function SectionGalleryEditor({
  cardId,
  sectionId,
  images,
}: SectionGalleryEditorProps) {
  if (images.length === 0) {
    return (
      <p className="text-xs italic text-zinc-400">
        Aucune image pour l&apos;instant.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {images.map((url) => (
        <SectionGalleryThumb
          key={url}
          cardId={cardId}
          sectionId={sectionId}
          url={url}
        />
      ))}
    </div>
  );
}

function SectionGalleryThumb({
  cardId,
  sectionId,
  url,
}: {
  cardId: string;
  sectionId: string;
  url: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    if (!window.confirm("Supprimer cette image de la rubrique ?")) return;
    startTransition(() => {
      void removeSectionGalleryImage(cardId, sectionId, url);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-black/10">
      <Image
        src={url}
        alt=""
        width={200}
        height={200}
        className={`h-24 w-full object-cover transition ${
          pending ? "opacity-40" : ""
        }`}
      />
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        aria-label="Supprimer l'image"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-zinc-700 shadow-md transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
