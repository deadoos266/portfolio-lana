import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEDIA_LABELS, type MediaType, type Publication } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PublicationsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .order("display_order", { ascending: true })
    .order("published_date", { ascending: false });

  const pubs = (data ?? []) as Publication[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Publications</h1>
        <Link
          href="/dashboard/publications/nouveau"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          + Ajouter
        </Link>
      </div>

      {pubs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          Aucune publication. Ajoute ton premier article, son ou reportage.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Média</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pubs.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {p.title}
                  </td>
                  <td className="px-4 py-3">
                    {MEDIA_LABELS[p.media_type as MediaType] ?? p.media_type}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.outlet ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {formatDate(p.published_date)}
                  </td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="text-green-600">●</span>
                    ) : (
                      <span className="text-zinc-300">●</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/publications/${p.id}`}
                      className="text-sm font-medium text-zinc-700 hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
