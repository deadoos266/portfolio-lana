import Image from "next/image";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { saveSiteSettings } from "../actions";
import { RichTextArea } from "@/components/RichTextArea";
import { ImagePositionControl } from "@/components/ImagePositionControl";
import {
  ALIGN_OPTIONS,
  WIDTH_OPTIONS,
  getProjetLayout,
  getVisionLayout,
} from "@/lib/layout-settings";
import { normalizePosition } from "@/lib/image-position";

const labelClass = "text-sm font-medium text-zinc-700";
const helpClass = "text-xs text-zinc-400";

interface MonSitePageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function MonSitePage({ searchParams }: MonSitePageProps) {
  const { saved } = await searchParams;
  const justSaved = saved === "1";

  const [
    banner,
    bannerText,
    photomaton,
    subtitle,
    intro,
    projet,
    vision,
    email,
    phone,
    projetLayout,
    visionLayout,
    bannerZoom,
    bannerPosX,
    bannerPosY,
    photomatonZoom,
    photomatonPosX,
    photomatonPosY,
    articleSectionTitle,
    articleButtonLabel,
  ] = await Promise.all([
    getSetting("banner_url"),
    getSetting("banner_text"),
    getSetting("photomaton_url"),
    getSetting("hero_subtitle"),
    getSetting("hero_intro"),
    getSetting("projet_text"),
    getSetting("vision_text"),
    getSetting("contact_email"),
    getSetting("contact_phone"),
    getProjetLayout(),
    getVisionLayout(),
    getSetting("banner_zoom"),
    getSetting("banner_pos_x"),
    getSetting("banner_pos_y"),
    getSetting("photomaton_zoom"),
    getSetting("photomaton_pos_x"),
    getSetting("photomaton_pos_y"),
    getSetting("article_section_title"),
    getSetting("article_button_label"),
  ]);
  const bannerPos = normalizePosition({
    zoom: bannerZoom,
    posX: bannerPosX,
    posY: bannerPosY,
  });
  const photomatonPos = normalizePosition({
    zoom: photomatonZoom,
    posX: photomatonPosX,
    posY: photomatonPosY,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mon site</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Personnalise ton portfolio : ta banderole, tes photos, tes textes et
            ton contact.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-ghost">
          Voir le résultat ↗
        </Link>
      </div>

      {justSaved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Enregistré ! Va voir ton site et fais <b>Ctrl + Maj + R</b> pour voir les changements.
        </div>
      )}

      <form action={saveSiteSettings} className="space-y-6">
        {/* Banderole PORTFOLIO */}
        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Ta banderole &laquo;&nbsp;PORTFOLIO&nbsp;&raquo;
            </h2>
            <p className={helpClass}>
              La zone tout en haut de la page d&apos;accueil. Tu peux mettre
              une image, un texte écrit, ou les deux (texte par-dessus
              l&apos;image).
            </p>
          </div>

          {/* Image de la banderole */}
          <div className="space-y-2 border-t border-zinc-100 pt-4">
            <label className={labelClass}>
              Image de la banderole (optionnel)
            </label>
            {banner && (
              <Image
                src={banner}
                alt="Banderole"
                width={400}
                height={200}
                className="rounded-lg border border-black/10"
              />
            )}
            <input
              name="banner"
              type="file"
              accept="image/*"
              className="input"
            />
            <p className={helpClass}>
              Laisse vide pour conserver l&apos;image actuelle. Retire-la depuis
              Supabase si tu veux repartir de zéro.
            </p>
            {banner && (
              <ImagePositionControl
                namePrefix="banner"
                initialValue={bannerPos}
              />
            )}
          </div>

          {/* Texte de la banderole (RichTextArea) */}
          <div className="border-t border-zinc-100 pt-4">
            <RichTextArea
              name="banner_text"
              label="Texte de la banderole (optionnel)"
              defaultValue={bannerText ?? ""}
              placeholder="PORTFOLIO"
              minHeight={140}
              helpText="Sélectionne ton texte, puis mets une TRÈS grosse taille (48, 72…) et la police que tu aimes depuis la barre d'outils. Si tu ne mets pas d'image, ce texte s'affiche seul. Si tu mets une image ET du texte, le texte apparaît par-dessus."
            />
          </div>
        </section>

        {/* Ton photomaton */}
        <section className="card space-y-4 p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Ton photomaton
            </h2>
            <p className={helpClass}>
              Une seule image, format long/vertical (comme un vrai photomaton
              avec 3-4 photos empilées). Elle s&apos;affichera à gauche de ton
              texte de présentation.
            </p>
          </div>
          {photomaton && (
            <Image
              src={photomaton}
              alt="Photomaton actuel"
              width={140}
              height={420}
              className="rounded-lg border border-black/10 object-cover"
            />
          )}
          <input
            name="photomaton"
            type="file"
            accept="image/*"
            className="input"
          />
          {photomaton && (
            <ImagePositionControl
              namePrefix="photomaton"
              initialValue={photomatonPos}
            />
          )}
        </section>

        {/* Textes */}
        <section className="card space-y-5 p-6">
          <h2 className="font-display text-xl font-semibold">Tes textes</h2>

          <div className="space-y-1.5">
            <label className={labelClass}>
              Petite phrase sous le titre PORTFOLIO
            </label>
            <input
              name="hero_subtitle"
              defaultValue={subtitle ?? ""}
              placeholder="Entrée en Master 1 Journalisme…"
              className="input"
            />
          </div>

          <RichTextArea
            name="hero_intro"
            label="Ta présentation (à côté de tes photos)"
            defaultValue={intro ?? ""}
            placeholder="Écris ici la phrase qui te présente…"
            minHeight={140}
          />

          <RichTextArea
            name="projet_text"
            label="Section « Mon projet professionnel »"
            defaultValue={projet ?? ""}
            placeholder="Écris ici le contenu de ton projet professionnel…"
            minHeight={220}
            helpText="Astuce : sélectionne du texte puis clique sur B / I / U ou choisis une autre police."
          />

          <RichTextArea
            name="vision_text"
            label="Section « Ma vision du journalisme »"
            defaultValue={vision ?? ""}
            placeholder="Écris ici ta vision du journalisme…"
            minHeight={220}
          />
        </section>

        {/* Mise en page des sections */}
        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Mise en page des sections
            </h2>
            <p className={helpClass}>
              Contrôle la <b>largeur</b> et l&apos;<b>alignement</b> du bloc de
              texte de chaque section, sans toucher au contenu.
            </p>
          </div>

          {/* Mon projet professionnel */}
          <div className="rounded-xl border border-zinc-100 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-zinc-800">
              Section « Mon projet professionnel »
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Largeur du bloc</label>
                <select
                  name="projet_width"
                  defaultValue={projetLayout.width}
                  className="input"
                >
                  {WIDTH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Alignement du bloc</label>
                <select
                  name="projet_align"
                  defaultValue={projetLayout.align}
                  className="input"
                >
                  {ALIGN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ma vision du journalisme */}
          <div className="rounded-xl border border-zinc-100 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-zinc-800">
              Section « Ma vision du journalisme »
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Largeur du bloc</label>
                <select
                  name="vision_width"
                  defaultValue={visionLayout.width}
                  className="input"
                >
                  {WIDTH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Alignement du bloc</label>
                <select
                  name="vision_align"
                  defaultValue={visionLayout.align}
                  className="input"
                >
                  {ALIGN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Textes des cartes-aperçu d'articles */}
        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Textes des cartes d&apos;articles
            </h2>
            <p className={helpClass}>
              Ces textes apparaissent sur les pages du parcours dès que tu
              ajoutes des liens d&apos;articles externes. Tu peux les styliser
              comme les autres textes (police, taille, gras, italique,
              couleur…).
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
        </section>

        {/* Contact */}
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">Ton contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>Email</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={email ?? ""}
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Téléphone (optionnel)</label>
              <input
                name="contact_phone"
                defaultValue={phone ?? ""}
                placeholder="06 12 34 56 78"
                className="input"
              />
            </div>
          </div>
        </section>

        <div>
          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-zinc-400">
        💡 Pour les cartes de la section &laquo;&nbsp;Mon
        parcours&nbsp;&raquo;, va dans{" "}
        <Link href="/dashboard/parcours" className="underline">
          Mon parcours
        </Link>
        .
      </p>
    </div>
  );
}
