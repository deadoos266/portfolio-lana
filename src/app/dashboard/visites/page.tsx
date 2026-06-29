import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteVisitButton } from "@/components/DeleteVisitButton";
import type { PageVisit } from "@/lib/types";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function place(v: PageVisit): string {
  const parts = [v.city, v.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function source(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

export default async function VisitesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("page_visits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const visits = (data ?? []) as PageVisit[];
  const humanVisits = visits.filter((v) => !v.is_bot);
  const botCount = visits.length - humanVisits.length;
  const unique = new Set(humanVisits.map((v) => v.ip).filter(Boolean)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Visites du site</h1>
        <p className="text-sm text-zinc-500">
          Toutes les visites de la page publique (pas seulement via les liens
          traqués).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Visites réelles" value={humanVisits.length} />
        <Stat label="Visiteurs uniques" value={unique} />
        <Stat label="Robots filtrés" value={botCount} />
        <Stat
          label="Dernière (réelle)"
          value={
            humanVisits[0] ? formatDateTime(humanVisits[0].created_at) : "—"
          }
          small
        />
      </div>

      {visits.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          Aucune visite enregistrée pour l&apos;instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Lieu</th>
                <th className="px-4 py-3">Appareil</th>
                <th className="px-4 py-3">Navigateur</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visits.map((v) => (
                <tr
                  key={v.id}
                  className={
                    v.is_bot ? "bg-zinc-50/60 text-zinc-400" : "hover:bg-zinc-50"
                  }
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDateTime(v.created_at)}
                    {v.is_bot && (
                      <span
                        className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600"
                        title={v.bot_reason ?? "robot"}
                      >
                        🤖
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
                      {v.path}
                    </code>
                  </td>
                  <td className="px-4 py-3">{place(v)}</td>
                  <td className="px-4 py-3 capitalize">
                    {v.device_type ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {v.browser ?? "—"}
                    {v.os ? <span className="text-zinc-400"> · {v.os}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{source(v.referrer)}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteVisitButton id={v.id} />
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

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold text-zinc-900 ${
          small ? "text-sm" : "text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
