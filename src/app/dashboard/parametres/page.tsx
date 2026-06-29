import { PinForm } from "./PinForm";
import { getSetting } from "@/lib/settings";
import { uploadCv } from "../actions";

export default async function ParametresPage() {
  const cvUrl = await getSetting("cv_url");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Réglages</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gère l&apos;accès et les éléments de ton espace.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changer le code d&apos;accès</h2>
        <PinForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">CV (PDF)</h2>
        <div className="card max-w-sm space-y-3 p-6">
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
            >
              📄 Voir le CV actuel
            </a>
          ) : (
            <p className="text-sm text-zinc-500">Aucun CV pour l&apos;instant.</p>
          )}
          <form action={uploadCv} className="space-y-3">
            <input
              name="cv"
              type="file"
              accept="application/pdf"
              required
              className="input"
            />
            <button type="submit" className="btn-primary">
              {cvUrl ? "Remplacer le CV" : "Ajouter le CV"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
