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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Publications</h1>
        <Link href="/dashboard/publications/nouveau" className="btn-primary">
          + Ajouter
        </Link>
      </div>

      {pubs.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-base font-medium text-zinc-700">
            Aucune publication
          </p>
          <p className="text-sm text-zinc-500">
            Ajoute ton premier article, son ou reportage.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <tr className="border-b border-black/5">
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
