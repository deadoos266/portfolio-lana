import Image from "next/image";
import { fetchOgTags } from "@/lib/og-fetch";
import { RichContent } from "@/components/RichContent";

interface ArticlePreviewProps {
  url: string;
  buttonLabel?: string;
}

/** Détermine si l'étiquette du bouton contient du HTML riche. */
function isRich(text: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(text);
}

/**
 * Carte-aperçu d'un article externe : image OG + titre + extrait + bouton
 * « Lire l'article ». Server component qui fetche les meta tags Open Graph
 * avec un cache d'1h.
 */
export async function ArticlePreview({
  url,
  buttonLabel = "Lire l'article →",
}: ArticlePreviewProps) {
  const og = await fetchOgTags(url);

  // Fallback minimaliste si l'article n'a pas pu être récupéré
  if (!og.ok) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Article externe
        </p>
        <p className="mt-2 break-all text-sm font-medium text-zinc-900">
          {url}
        </p>
        {isRich(buttonLabel) ? (
          <RichContent
            html={buttonLabel}
            className="mt-3 text-sm font-medium text-zinc-600"
          />
        ) : (
          <p className="mt-3 text-sm font-medium text-zinc-600">
            {buttonLabel}
          </p>
        )}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex"
    >
      {og.image && (
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-100 sm:aspect-auto sm:h-auto sm:w-64">
          <Image
            src={og.image}
            alt={og.title ?? "Aperçu de l'article"}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {og.siteName && (
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">
              {og.siteName}
            </p>
          )}
          {og.title && (
            <h3 className="font-display mt-2 text-xl font-semibold leading-snug text-zinc-900">
              {og.title}
            </h3>
          )}
          {og.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">
              {og.description}
            </p>
          )}
        </div>
        {isRich(buttonLabel) ? (
          <RichContent
            html={buttonLabel}
            className="mt-4 text-sm font-medium text-zinc-700 group-hover:underline"
          />
        ) : (
          <p className="mt-4 text-sm font-medium text-zinc-700 group-hover:underline">
            {buttonLabel}
          </p>
        )}
      </div>
    </a>
  );
}
