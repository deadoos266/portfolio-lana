import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { RichContent } from "@/components/RichContent";
import {
  aspectClass,
  imageDims,
  normalizeAspect,
  type ImageAspect,
} from "@/lib/image-aspect";

export const dynamic = "force-dynamic";

interface CardRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  slug: string | null;
  image_aspect: ImageAspect | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParcoursPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("parcours_cards")
    .select(
      "id, title, description, content, image_url, gallery_urls, slug, image_aspect",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();
  const card = data as CardRow;
  const gallery = card.gallery_urls ?? [];
  const hasContent = (card.content ?? "").trim().length > 0;
  const aspect = normalizeAspect(card.image_aspect);
  const dims = imageDims(aspect);

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--c-bg-main)", color: "var(--c-text-body)" }}
    >
      {/* Barre de retour */}
      <div className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <Link
            href="/#parcours"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <span aria-hidden>←</span> Retour au portfolio
          </Link>
        </div>
      </div>

      {/* Titre + image de couverture */}
      <header className="mx-auto max-w-4xl px-6 pt-16">
        <h1
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            fontStyle: "italic",
            textDecoration: "underline",
            textUnderlineOffset: "8px",
            color: "var(--c-text-titles)",
          }}
          className="text-3xl tracking-tight md:text-5xl"
        >
          {card.title}
        </h1>
        {card.description && (
          <p
            className="mt-4 text-lg leading-relaxed"
            style={{ color: "var(--c-text-body)" }}
          >
            {card.description}
          </p>
        )}

        {card.image_url && (
          <div
            className={`mt-10 relative w-full ${aspectClass(aspect)} overflow-hidden rounded-2xl border-[3px] shadow-md`}
            style={{ borderColor: "var(--c-button-bg)" }}
          >
            <Image
              src={card.image_url}
              alt={card.title}
              width={dims.width}
              height={dims.height}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        )}
      </header>

      {/* Contenu texte */}
      <section
        className="mx-auto max-w-3xl px-6 py-16"
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          color: "var(--c-text-body)",
        }}
      >
        {hasContent ? (
          <RichContent
            html={card.content}
            className="space-y-6 text-base leading-relaxed md:text-lg"
          />
        ) : (
          <p className="text-center text-sm italic text-zinc-400">
            Contenu en cours d&apos;écriture…
          </p>
        )}
      </section>

      {/* Galerie d'images supplémentaires */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {gallery.map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-zinc-100 shadow-sm"
              >
                <Image
                  src={src}
                  alt={`${card.title} — image ${i + 1}`}
                  width={800}
                  height={800}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Retour en bas */}
      <div className="border-t border-zinc-100">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center">
          <Link
            href="/#parcours"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <span aria-hidden>←</span> Retour au portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
