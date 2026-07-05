import Link from "next/link";
import { getFonts } from "@/lib/fonts";
import { FontsForm } from "./FontsForm";

export default async function PolicesPage() {
  const fonts = await getFonts();

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Polices</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Ta bibliothèque de polices : chaque élément du site peut recevoir
            sa propre police.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            💡 Pour chaque emplacement, clique sur une <b>catégorie</b> pour
            l&apos;ouvrir, puis choisis parmi les polices proposées — chacune
            est affichée avec un aperçu de ton texte réel.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-ghost">
          Voir le résultat ↗
        </Link>
      </div>

      <FontsForm initialFonts={fonts} />
    </div>
  );
}
