import Image from "next/image";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { saveSiteSettings } from "../actions";

const labelClass = "text-sm font-medium text-zinc-700";
const helpClass = "text-xs text-zinc-400";

export default async function MonSitePage() {
  const [
    banner,
    photomaton,
    subtitle,
    intro,
    projet,
    vision,
    email,
    phone,
  ] = await Promise.all([
    getSetting("banner_url"),
    getSetting("photomaton_url"),
    getSetting("hero_subtitle"),
    getSetting("hero_intro"),
    getSetting("projet_text"),
    getSetting("vision_text"),
    getSetting("contact_email"),
    getSetting("contact_phone"),
  ]);

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

      <form action={saveSiteSettings} className="space-y-6">
        {/* Banderole PORTFOLIO */}
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-xl font-semibold">
            Ta banderole &laquo;&nbsp;PORTFOLIO&nbsp;&raquo;
          </h2>
          <p className={helpClass}>
            L&apos;image en haut de la page d&apos;accueil (papier journal +
            ton titre).
          </p>
          {banner && (
            <Image
              src={banner}
              alt="Banderole"
              width={400}
              height={200}
              className="rounded-lg border border-black/10"
            />
          )}
          <input name="banner" type="file" accept="image/*" className="input" />
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

          <div className="space-y-1.5">
            <label className={labelClass}>
              Ta présentation (à côté de tes photos)
            </label>
            <textarea
              name="hero_intro"
              rows={5}
              defaultValue={intro ?? ""}
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              Section &laquo;&nbsp;Mon projet professionnel&nbsp;&raquo;
            </label>
            <textarea
              name="projet_text"
              rows={5}
              defaultValue={projet ?? ""}
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              Section &laquo;&nbsp;Ma vision du journalisme&nbsp;&raquo;
            </label>
            <textarea
              name="vision_text"
              rows={5}
              defaultValue={vision ?? ""}
              className="input"
            />
          </div>
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
