import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { RichTextArea } from "@/components/RichTextArea";
import { saveArticleCardTexts } from "./actions";

interface CardRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  slug: string | null;
  display_order: number;
}

interface ParcoursListPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function ParcoursListPage({
  searchParams,
}: ParcoursListPageProps) {
  const { saved } = await searchParams;
  const justSaved = saved === "1";

  const supabase = createAdminClient();
  const [{ data }, articleSectionTitle, articleButtonLabel] = await Promise.all([
    supabase
      .from("parcours_cards")
      .select(
        "id, title, description, content, image_url, gallery_urls, slug, display_order",
      )
      .order("display_order", { ascending: true }),
    getSetting("article_section_title"),
    getSetting("article_button_label"),
  ]);

  const cards = (data ?? []) as CardRow[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mon parcours</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Chaque carte a désormais sa propre page. Clique sur « Éditer » pour
            personnaliser son contenu (texte, image de couverture, galerie).
          </p>
        </div>
        <Link href="/#parcours" target="_blank" className="btn-ghost">
          Voir le carrousel ↗
        </Link>
      </div>

      {justSaved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Enregistré ! Va voir une page de carte avec des liens d&apos;articles pour vérifier.
        </div>
      )}

      {/* Textes des cartes-aperçu d'articles */}
      <form action={saveArticleCardTexts} className="card space-y-5 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Textes des cartes d&apos;articles
          </h2>
          <p className="text-xs text-zinc-400">
            Ces textes apparaissent sur les pages de carte dès que tu ajoutes
            des liens d&apos;articles externes. Tu peux les styliser comme les
            autres textes (police, taille, gras, italique, couleur…).
          </p>
        </div>

        <RichTextArea
          name="article_section_title"
          label="Titre de la section"
          defaultValue={articleSectionTitle ?? ""}
          placeholder="Mes articles publiés"
          minHeight={80}
          helpText="Titre qui apparaît au-dessus des cartes-aperçu. Laisse vide pour utiliser « Mes articles publiés »."
        />

        <RichTextArea
          name="article_button_label"
          label="Texte du bouton"
          defaultValue={articleButtonLabel ?? ""}
          placeholder="Lire l'article →"
          minHeight={60}
          helpText="Texte cliquable sur chaque carte. Ex : « Lien vers l'article », « Voir la publication », « Découvrir ». Laisse vide pour utiliser « Lire l'article → »."
        />

        <div>
          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const contentLen = (card.content ?? "").trim().length;
          const galleryCount = (card.gallery_urls ?? []).length;
          return (
            <div key={card.id} className="card flex gap-4 p-4">
              {/* Aperçu image */}
              <div className="shrink-0">
                {card.image_url ? (
                  <Image
                    src={card.image_url}
                    alt={card.title}
                    width={100}
                    height={100}
                    className="h-24 w-24 rounded-lg border border-black/10 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-black/10 bg-gradient-to-br from-pink-50 to-sky-50 text-[10px] text-zinc-400">
                    Pas d&apos;image
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    #{card.display_order}
                  </div>
                  <h3 className="mt-0.5 font-medium text-zinc-900">
                    {card.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    <StatusBadge
                      ok={contentLen > 0}
                      label={
                        contentLen > 0
                          ? `Texte (${contentLen} car.)`
                          : "Texte manquant"
                      }
                    />
                    <StatusBadge
                      ok={galleryCount > 0}
                      label={
                        galleryCount > 0
                          ? `${galleryCount} image${galleryCount > 1 ? "s" : ""}`
                          : "Aucune image galerie"
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={`/dashboard/parcours/${card.id}`}
                    className="btn-primary text-xs"
                  >
                    Éditer
                  </Link>
                  {card.slug && (
                    <Link
                      href={`/parcours/${card.slug}`}
                      target="_blank"
                      className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                    >
                      Voir la page ↗
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-medium ${
        ok
          ? "bg-emerald-50 text-emerald-700"
          : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {ok ? "✓" : "○"} {label}
    </span>
  );
}
