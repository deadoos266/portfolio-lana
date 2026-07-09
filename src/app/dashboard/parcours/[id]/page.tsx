import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { updateParcoursCard } from "../actions";
import { GalleryEditor } from "./GalleryEditor";
import { GalleryUploader } from "./GalleryUploader";
import { SectionsEditor, type SectionItem } from "./SectionsEditor";
import { RichTextArea } from "@/components/RichTextArea";
import { ImagePositionControl } from "@/components/ImagePositionControl";
import {
  IMAGE_ASPECT_OPTIONS,
  normalizeAspect,
  type ImageAspect,
} from "@/lib/image-aspect";
import { normalizePosition } from "@/lib/image-position";

interface CardRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  slug: string | null;
  display_order: number;
  image_aspect: ImageAspect | null;
  image_zoom: number | null;
  image_pos_x: number | null;
  image_pos_y: number | null;
  article_urls: string[] | null;
  sections: SectionItem[] | null;
  gallery_layout: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

const labelClass = "text-sm font-medium text-zinc-700";
const helpClass = "text-xs text-zinc-400";

export default async function EditParcoursPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = createAdminClient();

  const [{ data }, articleSectionTitle, articleButtonLabel] = await Promise.all([
    supabase
      .from("parcours_cards")
      .select(
        "id, title, description, content, image_url, gallery_urls, slug, display_order, image_aspect, image_zoom, image_pos_x, image_pos_y, article_urls, sections, gallery_layout",
      )
      .eq("id", id)
      .maybeSingle(),
    getSetting("article_section_title"),
    getSetting("article_button_label"),
  ]);

  if (!data) notFound();
  const card = data as CardRow;
  const gallery = card.gallery_urls ?? [];
  const currentAspect = normalizeAspect(card.image_aspect);
  const currentPosition = normalizePosition({
    zoom: card.image_zoom,
    posX: card.image_pos_x,
    posY: card.image_pos_y,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/parcours"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Retour aux 7 cartes
        </Link>
        {card.slug && (
          <Link
            href={`/parcours/${card.slug}`}
            target="_blank"
            className="btn-ghost"
          >
            Voir la page publique ↗
          </Link>
        )}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Carte #{card.display_order}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {card.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Adresse publique :{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
            /parcours/{card.slug ?? "?"}
          </code>
        </p>
      </div>

      <form
        action={updateParcoursCard.bind(null, card.id)}
        className="space-y-6"
      >
        <input type="hidden" name="slug" value={card.slug ?? ""} />

        {/* Infos de base */}
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Infos de la carte</h2>

          <div className="space-y-1.5">
            <label className={labelClass}>Titre</label>
            <input
              name="title"
              defaultValue={card.title}
              required
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              Petit texte (affiché sur la carte du carrousel)
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={card.description ?? ""}
              placeholder="Une phrase courte pour donner envie de cliquer…"
              className="input"
            />
          </div>
        </section>

        {/* Image de couverture — carrousel uniquement */}
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">
            Image de la carte (carrousel)
          </h2>
          <p className={helpClass}>
            Cette image s&apos;affiche <b>uniquement sur la carte du carrousel</b>{" "}
            de la page d&apos;accueil. La page dédiée, elle, se construit
            librement avec le texte et la galerie plus bas — c&apos;est toi qui
            décides quoi y mettre.
          </p>
          {card.image_url && (
            <Image
              src={card.image_url}
              alt="Couverture actuelle"
              width={280}
              height={180}
              className="rounded-lg border border-black/10 object-cover"
            />
          )}
          <input
            name="image"
            type="file"
            accept="image/*"
            className="input"
          />
          <p className={helpClass}>
            Laisse vide pour conserver l&apos;image actuelle.
          </p>

          <div className="space-y-1.5 border-t border-zinc-100 pt-4">
            <label className={labelClass}>Format de la photo</label>
            <select
              name="image_aspect"
              defaultValue={currentAspect}
              className="input"
            >
              {IMAGE_ASPECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className={helpClass}>
              Forme du cadre de l&apos;image sur la carte du carrousel. Le
              fichier de l&apos;image reste le même.
            </p>
          </div>

          {card.image_url && (
            <ImagePositionControl
              namePrefix="image"
              initialValue={currentPosition}
            />
          )}
        </section>

        {/* Contenu texte */}
        <section className="card space-y-3 p-6">
          <RichTextArea
            name="content"
            label="Texte de la page dédiée"
            defaultValue={card.content ?? ""}
            placeholder="Écris ici ce que tu veux raconter dans cette rubrique. Laisse vide si tu ne veux pas de texte."
            minHeight={360}
            helpText="Ce texte s'affiche sur la page dédiée (quand quelqu'un clique sur la carte). Sélectionne du texte puis clique sur B / I / U pour le formater. Nouvelle ligne pour créer un paragraphe."
          />
        </section>

        {/* Rubriques nommées (optionnel) */}
        <section className="card space-y-4 p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Rubriques (optionnel)
            </h2>
            <p className={helpClass}>
              Pour découper la page en plusieurs parties nommées avec leur
              propre petite navigation en haut — comme « Mon projet
              professionnel / Ma vision du journalisme / Mon parcours » sur
              l&apos;accueil. Laisse vide si tu ne veux qu&apos;un seul texte
              (ci-dessus).
            </p>
          </div>
          <SectionsEditor
            cardId={card.id}
            name="section_ids"
            initialSections={card.sections ?? []}
          />
        </section>

        {/* Galerie */}
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">
            Fichiers de la page dédiée
          </h2>
          <p className={helpClass}>
            Images ou PDF (ex : captures ou scans de tes articles). Ajoute-en
            autant que tu veux, ou aucun si tu ne veux que du texte.
          </p>

          <div className="space-y-1.5 border-b border-zinc-100 pb-4">
            <label className={labelClass}>Mode d&apos;affichage</label>
            <select
              name="gallery_layout"
              defaultValue={card.gallery_layout ?? "grid"}
              className="input"
            >
              <option value="grid">Grille (tout affiché en même temps)</option>
              <option value="carousel">
                Carrousel (un fichier à la fois, avec flèches)
              </option>
            </select>
            <p className={helpClass}>
              Le carrousel affiche un fichier à la fois avec des flèches
              précédent/suivant ; le suivant apparaît en fondu par-dessus le
              précédent.
            </p>
          </div>

          <GalleryEditor id={card.id} images={gallery} />
          <label className={labelClass}>Ajouter des fichiers</label>
          <GalleryUploader cardId={card.id} />
        </section>

        {/* Articles externes */}
        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Liens d&apos;articles externes
            </h2>
            <p className={helpClass}>
              Colle une URL par ligne. Sur la page dédiée, chaque URL devient
              une carte-aperçu avec l&apos;image, le titre et un extrait de
              l&apos;article — utile pour tes publications sur mouvement.net,
              un blog, une revue, etc.
            </p>
          </div>

          <RichTextArea
            name="article_section_title"
            label="Titre de la section (au-dessus des cartes-aperçu)"
            defaultValue={articleSectionTitle ?? ""}
            placeholder="Mes articles publiés"
            minHeight={80}
            helpText="Commun à toutes les cartes. Laisse vide pour utiliser « Mes articles publiés »."
          />

          <RichTextArea
            name="article_button_label"
            label="Texte du bouton (sur chaque carte-aperçu)"
            defaultValue={articleButtonLabel ?? ""}
            placeholder="Lire l'article →"
            minHeight={60}
            helpText="Commun à toutes les cartes. Laisse vide pour utiliser « Lire l'article → »."
          />

          <div className="border-t border-zinc-100 pt-4">
            <label className={labelClass}>Liens d&apos;articles de cette carte</label>
            <textarea
              name="article_urls"
              rows={5}
              defaultValue={(card.article_urls ?? []).join("\n")}
              placeholder="https://www.mouvement.net/scenes/…"
              className="input mt-1.5 font-mono text-xs"
              spellCheck={false}
            />
            <p className={`${helpClass} mt-1.5`}>
              Chaque ligne = un lien. Laisse vide pour ne rien afficher.
            </p>
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-md">
          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
          <Link
            href="/dashboard/parcours"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            Annuler
          </Link>
          {saved === "1" && (
            <span className="text-sm font-medium text-emerald-700">
              ✓ Enregistré !
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
