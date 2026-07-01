import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateParcoursCard } from "../actions";
import { GalleryEditor } from "./GalleryEditor";

interface CardRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  gallery_urls: string[] | null;
  slug: string | null;
  display_order: number;
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

  const { data } = await supabase
    .from("parcours_cards")
    .select(
      "id, title, description, content, image_url, link_url, gallery_urls, slug, display_order",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const card = data as CardRow;
  const gallery = card.gallery_urls ?? [];

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

      {saved === "1" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Enregistré ! Fais Ctrl + Maj + R sur la page publique pour voir tes
          changements.
        </div>
      )}

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

          <div className="space-y-1.5">
            <label className={labelClass}>
              Lien externe (optionnel, remplace la page interne)
            </label>
            <input
              name="link_url"
              defaultValue={card.link_url ?? ""}
              placeholder="https://…"
              className="input"
            />
            <p className={helpClass}>
              Laisse vide pour que la carte pointe vers ta page interne
              /parcours/{card.slug}.
            </p>
          </div>
        </section>

        {/* Image de couverture */}
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">
            Image de couverture
          </h2>
          <p className={helpClass}>
            L&apos;image principale de la carte + le grand visuel en haut de la
            page publique.
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
        </section>

        {/* Contenu texte */}
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">
            Contenu de la page
          </h2>
          <p className={helpClass}>
            Le texte affiché sur la page publique. Une ligne vide entre deux
            paragraphes. Tu peux utiliser <code>*italique*</code> et{" "}
            <code>**gras**</code>.
          </p>
          <textarea
            name="content"
            rows={16}
            defaultValue={card.content ?? ""}
            placeholder="Écris ici le contenu de cette rubrique…"
            className="input font-mono text-sm"
          />
        </section>

        {/* Galerie */}
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">
            Galerie d&apos;images
          </h2>
          <p className={helpClass}>
            Ajoute autant d&apos;images que tu veux : elles s&apos;afficheront
            en grille sous ton texte sur la page publique.
          </p>
          <GalleryEditor id={card.id} images={gallery} />
          <label className={labelClass}>Ajouter des images</label>
          <input
            name="gallery"
            type="file"
            accept="image/*"
            multiple
            className="input"
          />
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
        </div>
      </form>
    </div>
  );
}
