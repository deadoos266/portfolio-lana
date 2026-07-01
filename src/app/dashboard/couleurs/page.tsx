import Link from "next/link";
import { getTheme } from "@/lib/theme";
import { PaletteForm } from "./PaletteForm";

export default async function CouleursPage() {
  const theme = await getTheme();

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Couleurs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Ta palette : chaque pinceau colore un élément précis du site.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            💡 3 façons de choisir une couleur : clique sur un <b>carré coloré</b>{" "}
            (nuancier libre), tape un <b>code couleur</b> (ex : #FBF9F4), ou clique
            sur une <b>suggestion</b> juste en dessous.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-ghost">
          Voir le résultat ↗
        </Link>
      </div>

      <PaletteForm initialTheme={theme} />
    </div>
  );
}
