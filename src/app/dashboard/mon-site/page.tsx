import Image from "next/image";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { saveSiteSettings } from "../actions";

export default async function MonSitePage() {
  const [photo, tagline, intro, email, phone] = await Promise.all([
    getSetting("profile_photo_url"),
    getSetting("tagline"),
    getSetting("intro_text"),
    getSetting("contact_email"),
    getSetting("contact_phone"),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mon site</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Personnalise ta page d&apos;accueil : ta photo, ta présentation, ton
            contact.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-ghost">
          Voir le résultat ↗
        </Link>
      </div>

      <form action={saveSiteSettings} className="card space-y-6 p-6">
        {/* Photo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Ta photo</label>
          {photo && (
            <Image
              src={photo}
              alt="Ta photo"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-black/10 object-cover"
            />
          )}
          <input name="photo" type="file" accept="image/*" className="input" />
          <p className="text-xs text-zinc-400">
            Une belle photo de toi, de préférence carrée. Laisse vide pour
            garder l&apos;actuelle.
          </p>
        </div>

        {/* Accroche */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Petite phrase sous ton nom
          </label>
          <input
            name="tagline"
            defaultValue={tagline ?? ""}
            placeholder="Journaliste — à la recherche d'une alternance"
            className="input"
          />
        </div>

        {/* Présentation */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Ta présentation
          </label>
          <textarea
            name="intro_text"
            rows={5}
            defaultValue={intro ?? ""}
            placeholder="Quelques phrases sur toi : qui tu es, ce qui te passionne dans le journalisme, ce que tu recherches…"
            className="input"
          />
          <p className="text-xs text-zinc-400">
            Pas d&apos;inquiétude, tu peux écrire simplement — ou me demander de
            t&apos;aider à la rédiger.
          </p>
        </div>

        {/* Contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Email de contact
            </label>
            <input
              name="contact_email"
              type="email"
              defaultValue={email ?? ""}
              placeholder="ton.email@exemple.com"
              className="input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Téléphone (optionnel)
            </label>
            <input
              name="contact_phone"
              defaultValue={phone ?? ""}
              placeholder="06 12 34 56 78"
              className="input"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
