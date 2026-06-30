import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateParcoursCard } from "./actions";

interface CardRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  display_order: number;
}

export default async function ParcoursPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("parcours_cards")
    .select("*")
    .order("display_order", { ascending: true });

  const cards = (data ?? []) as CardRow[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Mon parcours
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Les 7 cartes affichées sur ton site (carrousel défilable).
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-ghost">
          Voir le résultat ↗
        </Link>
      </div>

      <div className="space-y-4">
        {cards.map((card) => (
          <CardEditor key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function CardEditor({ card }: { card: CardRow }) {
  return (
    <form
      action={updateParcoursCard.bind(null, card.id)}
      className="card grid gap-4 p-5 sm:grid-cols-[140px_1fr_auto] sm:items-start"
    >
      {/* Aperçu image */}
      <div className="flex h-full items-start">
        {card.image_url ? (
          <Image
            src={card.image_url}
            alt={card.title}
            width={140}
            height={140}
            className="aspect-square w-full rounded-lg border border-black/10 object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-black/10 bg-gradient-to-br from-pink-50 to-sky-50 text-xs text-zinc-400">
            Pas d&apos;image
          </div>
        )}
      </div>

      {/* Champs */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            Titre #{card.display_order}
          </label>
          <input
            name="title"
            defaultValue={card.title}
            required
            className="input"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            Petit texte (optionnel)
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={card.description ?? ""}
            placeholder="Une phrase courte pour décrire cette carte…"
            className="input"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">
              Lien (optionnel)
            </label>
            <input
              name="link_url"
              defaultValue={card.link_url ?? ""}
              placeholder="https://…"
              className="input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">
              Image (optionnel)
            </label>
            <input name="image" type="file" accept="image/*" className="input" />
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <button type="submit" className="btn-primary">
          Enregistrer
        </button>
      </div>
    </form>
  );
}
