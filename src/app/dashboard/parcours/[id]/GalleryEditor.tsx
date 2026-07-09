"use client";

import Image from "next/image";
import { useTransition } from "react";
import { removeGalleryImage } from "../actions";
import { isPdf, fileDisplayName } from "@/lib/file-type";

interface GalleryEditorProps {
  id: string;
  images: ReadonlyArray<string>;
}

export function GalleryEditor({ id, images }: GalleryEditorProps) {
  if (images.length === 0) {
    return (
      <p className="text-xs italic text-zinc-400">
        Aucun fichier pour l&apos;instant.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {images.map((url) => (
        <GalleryThumb key={url} id={id} url={url} />
      ))}
    </div>
  );
}

function GalleryThumb({ id, url }: { id: string; url: string }) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    if (!window.confirm("Supprimer ce fichier de la galerie ?")) return;
    startTransition(() => {
      void removeGalleryImage(id, url);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-black/10">
      {isPdf(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-24 w-full flex-col items-center justify-center gap-1 bg-zinc-50 p-1 text-center transition hover:bg-zinc-100 ${
            pending ? "opacity-40" : ""
          }`}
        >
          <span aria-hidden className="text-xl">
            📄
          </span>
          <span className="line-clamp-2 text-[10px] font-medium text-zinc-600">
            {fileDisplayName(url)}
          </span>
        </a>
      ) : (
        <Image
          src={url}
          alt=""
          width={200}
          height={200}
          className={`h-24 w-full object-cover transition ${
            pending ? "opacity-40" : ""
          }`}
        />
      )}
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        aria-label="Supprimer le fichier"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-zinc-700 shadow-md transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
