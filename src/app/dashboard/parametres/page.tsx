import { PinForm } from "./PinForm";
import { getSetting } from "@/lib/settings";
import { uploadCv } from "../actions";

export default async function ParametresPage() {
  const cvUrl = await getSetting("cv_url");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Réglages</h1>
        <p className="text-sm text-zinc-500">
          Gère l&apos;accès et les éléments de ton espace.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changer le code d&apos;accès</h2>
        <PinForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">CV (PDF)</h2>
        <div className="max-w-sm space-y-3 rounded-xl border border-zinc-200 bg-white p-6">
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
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              {cvUrl ? "Remplacer le CV" : "Ajouter le CV"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
