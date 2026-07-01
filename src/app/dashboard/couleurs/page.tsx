import Link from "next/link";
import {
  getTheme,
  SWATCHES,
  type SiteTheme,
  type SwatchInfo,
} from "@/lib/theme";
import { saveThemeAction, resetThemeAction } from "./actions";

const GROUPS: ReadonlyArray<SwatchInfo["group"]> = [
  "Textes",
  "Accents",
  "Fonds",
  "Boutons",
];

export default async function CouleursPage() {
  const theme = await getTheme();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Couleurs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Ta palette : chaque pinceau colore un élément précis du site. Clique
            sur un carré pour choisir n&apos;importe quelle couleur.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-ghost">
          Voir le résultat ↗
        </Link>
      </div>

      <form action={saveThemeAction} className="space-y-8">
        {GROUPS.map((group) => (
          <SwatchGroup key={group} group={group} theme={theme} />
        ))}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">
            Enregistrer les couleurs
          </button>
          <ResetForm />
        </div>
      </form>
    </div>
  );
}

function SwatchGroup({
  group,
  theme,
}: {
  group: SwatchInfo["group"];
  theme: SiteTheme;
}) {
  const swatches = SWATCHES.filter((s) => s.group === group);
  return (
    <section className="card p-6">
      <h2 className="mb-4 text-lg font-semibold">{group}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {swatches.map((swatch) => (
          <Swatch key={swatch.key} swatch={swatch} value={theme[swatch.key]} />
        ))}
      </div>
    </section>
  );
}

function Swatch({
  swatch,
  value,
}: {
  swatch: SwatchInfo;
  value: string;
}) {
  return (
    <label className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-3 transition hover:border-zinc-200">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black/10 shadow-sm">
        <input
          type="color"
          name={swatch.key}
          defaultValue={value}
          className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
          aria-label={swatch.label}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-900">{swatch.label}</div>
        <div className="text-xs text-zinc-500">{swatch.description}</div>
        <div className="mt-0.5 text-[10px] font-mono uppercase text-zinc-400">
          {value}
        </div>
      </div>
    </label>
  );
}

function ResetForm() {
  return (
    <form action={resetThemeAction}>
      <button
        type="submit"
        className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline"
      >
        Revenir aux couleurs d&apos;origine
      </button>
    </form>
  );
}
