import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { RichContent } from "@/components/RichContent";
import { ArticlePreview } from "@/components/ArticlePreview";
import { FileCarousel } from "@/components/FileCarousel";
import { SectionsNav } from "@/components/SectionsNav";
import { documentsSettingKey, parseDocuments } from "@/lib/card-documents";

export const dynamic = "force-dynamic";

interface SectionItem {
  id: string;
  label: string;
  content: string;
  gallery_urls?: string[];
  video_url?: string | null;
}

interface CardRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  gallery_urls: string[] | null;
  slug: string | null;
  article_urls: string[] | null;
  sections: SectionItem[] | null;
  gallery_layout: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParcoursPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const [{ data }, articleSectionTitle, articleButtonLabel, rawDocuments] = await Promise.all([
    supabase
      .from("parcours_cards")
      .select("id, title, description, content, gallery_urls, slug, article_urls, sections, gallery_layout")
      .eq("slug", slug)
      .maybeSingle(),
    getSetting("article_section_title"),
    getSetting("article_button_label"),
    getSetting(documentsSettingKey(slug)),
  ]);

  if (!data) notFound();
  const card = data as CardRow;
  const gallery = card.gallery_urls ?? [];
  const articles = card.article_urls ?? [];
  const sections = (card.sections ?? []).filter(
    (s) => s.label.trim().length > 0,
  );
  const documents = parseDocuments(rawDocuments).filter((d) => d.url);
  const hasContent = (card.content ?? "").trim().length > 0;
  const sectionTitle = articleSectionTitle?.trim() || "Mes articles publiés";
  const buttonLabel = articleButtonLabel?.trim() || "Lire l'article →";

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

      {/* Titre + petite description */}
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
      </header>

      {/* Contenu texte — aligné avec le titre (max-w-4xl) */}
      {(hasContent || sections.length === 0) && (
        <section
          className="mx-auto max-w-4xl px-6 py-16"
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
      )}

      {/* Rubriques nommées : petite navigation fixe + sections ancrées */}
      {sections.length > 0 && (
        <>
          <SectionsNav sections={sections.map((s) => ({ id: s.id, label: s.label }))} />

          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16"
            >
              <h2
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontWeight: 700,
                  fontStyle: "italic",
                  textDecoration: "underline",
                  textUnderlineOffset: "6px",
                  color: "var(--c-text-titles)",
                }}
                className="mb-6 text-2xl tracking-tight"
              >
                {s.label}
              </h2>
              {s.content.trim() ? (
                <RichContent
                  html={s.content}
                  className="space-y-6 text-base leading-relaxed md:text-lg"
                  style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    color: "var(--c-text-body)",
                  }}
                />
              ) : (
                <p className="text-sm italic text-zinc-400">
                  Contenu en cours d&apos;écriture…
                </p>
              )}
              {s.video_url && (
                // Vignette volontairement petite (largeur plafonnée) : reste
                // une taille "aperçu" agréable, quelle que soit l'orientation
                // de la vidéo (portrait ou paysage), et rétrécit sur mobile.
                <video
                  src={s.video_url}
                  controls
                  preload="metadata"
                  className="mx-auto mt-8 block w-full max-w-[280px] rounded-2xl border border-zinc-100 shadow-md"
                />
              )}
              {(s.gallery_urls ?? []).length > 0 && (
                <div className="mt-8">
                  <SectionGallery
                    images={s.gallery_urls ?? []}
                    altPrefix={s.label}
                  />
                </div>
              )}
            </section>
          ))}
        </>
      )}

      {/* Galerie / fichiers supplémentaires */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          {card.gallery_layout === "carousel" ? (
            <FileCarousel files={gallery} altPrefix={card.title} />
          ) : gallery.length === 1 ? (
            // Une seule image : affichage GRAND, pleine largeur, sans rognage
            <div className="overflow-hidden rounded-2xl border border-zinc-100 shadow-md">
              <Image
                src={gallery[0]}
                alt={card.title}
                width={2400}
                height={1600}
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="h-auto w-full"
                priority
              />
            </div>
          ) : (
            // Plusieurs images : grille (2 puis 3 colonnes)
            <div
              className={`grid gap-4 ${
                gallery.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 md:grid-cols-3"
              }`}
            >
              {gallery.map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-zinc-100 shadow-sm"
                >
                  <Image
                    src={src}
                    alt={`${card.title} — image ${i + 1}`}
                    width={1200}
                    height={1200}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Documents PDF : version nette (texte vectoriel) des fichiers ci-dessus */}
      {documents.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="flex flex-wrap justify-center gap-3">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md"
                style={{
                  borderColor: "var(--c-text-titles)",
                  color: "var(--c-text-titles)",
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                <span aria-hidden>📄</span>
                {doc.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Versions PDF : texte net à tout niveau de zoom, idéal sur téléphone.
          </p>
        </section>
      )}

      {/* Articles externes */}
      {articles.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-20">
          {/^<\/?[a-z][^>]*>/i.test(sectionTitle) ? (
            <RichContent
              html={sectionTitle}
              className="mb-6"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            />
          ) : (
            <h2
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--c-text-titles)",
              }}
              className="mb-6 text-2xl tracking-tight"
            >
              {sectionTitle}
            </h2>
          )}
          <div className="space-y-4">
            {articles.map((url) => (
              <ArticlePreview key={url} url={url} buttonLabel={buttonLabel} />
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

/** Galerie d'images d'une rubrique : 1 image = pleine largeur, sinon grille. */
function SectionGallery({
  images,
  altPrefix,
}: {
  images: ReadonlyArray<string>;
  altPrefix: string;
}) {
  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-100 shadow-md">
        <Image
          src={images[0]}
          alt={altPrefix}
          width={2000}
          height={1300}
          sizes="(max-width: 896px) 100vw, 896px"
          className="h-auto w-full"
        />
      </div>
    );
  }
  return (
    <div
      className={`grid gap-4 ${
        images.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3"
      }`}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-zinc-100 shadow-sm"
        >
          <Image
            src={src}
            alt={`${altPrefix} — image ${i + 1}`}
            width={900}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
