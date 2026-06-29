import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrigin } from "@/lib/origin";
import { CopyButton } from "@/components/CopyButton";
import { StatusSelect } from "@/components/StatusSelect";
import { createApplication } from "./actions";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type Application,
  type ApplicationStatus,
  type TrackedLink,
} from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const origin = await getOrigin();

  const [{ data: applications }, { data: links }, { data: opens }] =
    await Promise.all([
      supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("tracked_links").select("*"),
      supabase.from("link_opens").select("link_id, opened_at"),
    ]);

  const linkByApp = new Map<string, TrackedLink>();
  for (const link of (links ?? []) as TrackedLink[]) {
    if (link.application_id) linkByApp.set(link.application_id, link);
  }

  const openStats = new Map<string, { count: number; last: string | null }>();
  for (const open of opens ?? []) {
    const current = openStats.get(open.link_id) ?? { count: 0, last: null };
    current.count += 1;
    if (!current.last || open.opened_at > current.last) {
      current.last = open.opened_at;
    }
    openStats.set(open.link_id, current);
  }

  const apps = (applications ?? []) as Application[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Candidatures</h1>
        <span className="text-sm text-zinc-500">{apps.length} au total</span>
      </div>

      <NewApplicationForm />

      {apps.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          Aucune candidature pour l&apos;instant. Ajoute-en une ci-dessus.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Lien traqué</th>
                <th className="px-4 py-3 text-center">Ouvertures</th>
                <th className="px-4 py-3">Dernière</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {apps.map((app) => {
                const link = linkByApp.get(app.id);
                const stats = link ? openStats.get(link.id) : undefined;
                const shortUrl = link ? `${origin}/l/${link.slug}` : null;
                return (
                  <tr key={app.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900">
                        {app.company_name}
                      </div>
                      {app.role && (
                        <div className="text-xs text-zinc-500">{app.role}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        id={app.id}
                        status={app.status as ApplicationStatus}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {shortUrl ? (
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
                            /l/{link!.slug}
                          </code>
                          <CopyButton value={shortUrl} />
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">aucun</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {stats?.count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatDate(stats?.last ?? null)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/a/${app.id}`}
                        className="text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
                      >
                        Détail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <StatusLegend />
    </div>
  );
}

function NewApplicationForm() {
  const field =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900";
  return (
    <details className="rounded-xl border border-zinc-200 bg-white p-4">
      <summary className="cursor-pointer font-medium text-zinc-900">
        + Nouvelle candidature
      </summary>
      <form action={createApplication} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            Entreprise *
          </label>
          <input name="company_name" required className={field} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">Poste</label>
          <input name="role" className={field} placeholder="Alternance…" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600">
            Lien à traquer (destination)
          </label>
          <input
            name="destination_url"
            className={field}
            placeholder="ex: mon-portfolio.com  ou  lien Google Drive du CV"
          />
          <p className="text-xs text-zinc-400">
            Un lien traqué unique sera généré et redirigera vers cette adresse.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">Contact</label>
          <input name="contact_name" className={field} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            Email du contact
          </label>
          <input name="contact_email" type="email" className={field} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600">Notes</label>
          <textarea name="notes" rows={2} className={field} />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Créer
          </button>
        </div>
      </form>
    </details>
  );
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <span
          key={key}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[key as ApplicationStatus]
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
