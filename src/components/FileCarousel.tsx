"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
 * Cliquer sur une image l'agrandit en plein écran (les PDF, eux, s'ouvrent
 * déjà en grand dans un nouvel onglet).
 */
export function FileCarousel({ files, altPrefix }: FileCarouselProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Zoom lecture : les fichiers sont souvent des pages A4 de texte dense,
  // illisibles sur téléphone une fois réduites à la taille de l'écran.
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, index]);

  if (files.length === 0) return null;

  function goTo(i: number) {
    setIndex((i + files.length) % files.length);
    setZoomed(false); // on repart en vue d'ensemble à chaque changement
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setZoomed(false);
  }

  const currentUrl = files[index];
  const currentIsPdf = isPdf(currentUrl);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 bg-zinc-50 shadow-md"
        style={{ borderColor: "var(--c-text-titles)" }}
      >
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
                <span
                  aria-hidden
                  className="text-xs uppercase tracking-[0.2em] text-zinc-400"
                >
                  Document
                </span>
                <span className="text-sm font-medium text-zinc-700 break-words">
                  {fileDisplayName(url)}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  Ouvrir le PDF ↗
                </span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Agrandir l'image"
                className="group h-full w-full cursor-zoom-in"
              >
                <Image
                  src={url}
                  alt={`${altPrefix}, page ${i + 1} sur ${files.length}`}
                  fill
                  sizes="(max-width: 384px) 100vw, 384px"
                  className="object-contain transition group-hover:opacity-90"
                />
              </button>
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

      {lightboxOpen && !currentIsPdf && (
        <div
          className={`fixed inset-0 z-50 bg-black/90 ${
            zoomed ? "overflow-auto" : "flex items-center justify-center p-4 sm:p-8"
          }`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Fermer"
            className="fixed right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20"
          >
            ×
          </button>

          {/* Indice de lecture : sans ça, on ne devine pas qu'un second
              niveau de zoom existe (crucial pour les pages A4 de texte). */}
          <p className="fixed left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur">
            {zoomed ? "Appuie sur l’image pour dézoomer" : "Appuie sur l’image pour agrandir le texte"}
          </p>

          <Image
            src={currentUrl}
            alt={`${altPrefix}, page ${index + 1} sur ${files.length}`}
            width={1200}
            height={1700}
            // `sizes` doit refléter la largeur d'affichage RÉELLE, sinon le
            // navigateur ne télécharge que la petite variante calée sur le
            // téléphone et le zoom afficherait une image floue (étirée).
            sizes={zoomed ? "1200px" : "100vw"}
            priority
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
            className={
              zoomed
                ? "h-auto w-[1200px] max-w-none cursor-zoom-out"
                : "mx-auto h-auto max-h-[85vh] w-auto max-w-full cursor-zoom-in"
            }
          />

          {files.length > 1 && !zoomed && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index - 1);
                }}
                aria-label="Fichier précédent"
                className="fixed left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index + 1);
                }}
                aria-label="Fichier suivant"
                className="fixed right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
