"use client";

import Image from "next/image";
import { useState } from "react";
import { isPdf, fileDisplayName } from "@/lib/file-type";

interface FileCarouselProps {
  files: ReadonlyArray<string>;
  altPrefix: string;
}

/**
 * Carrousel une-vignette-à-la-fois : chaque fichier suivant apparaît en
 * fondu par-dessus le précédent (au lieu d'un défilement horizontal). Gère
 * à la fois des images et des PDF (affichés comme une carte-document avec
 * lien d'ouverture, un PDF ne pouvant pas se rendre comme une image).
 */
export function FileCarousel({ files, altPrefix }: FileCarouselProps) {
  const [index, setIndex] = useState(0);

  if (files.length === 0) return null;

  function goTo(i: number) {
    setIndex((i + files.length) % files.length);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 shadow-md">
        {files.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{
              opacity: i === index ? 1 : 0,
              zIndex: i === index ? 1 : 0,
            }}
            aria-hidden={i !== index}
          >
            {isPdf(url) ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center transition hover:bg-zinc-100"
              >
                <span aria-hidden className="text-5xl">
                  📄
                </span>
                <span className="text-sm font-medium text-zinc-700 break-words">
                  {fileDisplayName(url)}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  Ouvrir le PDF ↗
                </span>
              </a>
            ) : (
              <Image
                src={url}
                alt={`${altPrefix} — fichier ${i + 1}`}
                fill
                sizes="(max-width: 384px) 100vw, 384px"
                className="object-contain"
              />
            )}
          </div>
        ))}

        {files.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Fichier précédent"
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md transition hover:bg-white"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Fichier suivant"
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md transition hover:bg-white"
            >
              →
            </button>
          </>
        )}
      </div>

      {files.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {files.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Aller au fichier ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-zinc-700" : "w-1.5 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
