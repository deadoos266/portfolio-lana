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
      supabase.from("link_opens").select("link_id, opened_at, is_bot"),
    ]);

  const linkByApp = new Map<string, TrackedLink>();
  for (const link of (links ?? []) as TrackedLink[]) {
    if (link.application_id) linkByApp.set(link.application_id, link);
  }

  const openStats = new Map<
    string,
    { human: number; bot: number; last: string | null }
  >();
  for (const open of opens ?? []) {
    const current = openStats.get(open.link_id) ?? {
      human: 0,
      bot: 0,
      last: null,
    };
    if (open.is_bot) {
      current.bot += 1;
    } else {
      current.human += 1;
      if (!current.last || open.opened_at > current.last) {
        current.last = open.opened_at;
      }
    }
    openStats.set(open.link_id, current);
  }

  const apps = (applications ?? []) as Application[];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Candidatures</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Suis tes candidatures et vois qui ouvre tes liens.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-medium text-zinc-500 shadow-sm">
          {apps.length}
        </span>
      </header>

      <NewApplicationForm />

      {apps.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-base font-medium text-zinc-700">
            Aucune candidature pour l&apos;instant
          </p>
          <p className="text-sm text-zinc-500">
            Ajoute ta première candidature avec le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <tr className="border-b border-black/5">
                <th className="px-5 py-4">Entreprise</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4">Lien traqué</th>
                <th className="px-5 py-4 text-center">Ouvertures</th>
                <th className="px-5 py-4">Dernière</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => {
                const link = linkByApp.get(app.id);
                const stats = link ? openStats.get(link.id) : undefined;
                const shortUrl = link ? `${origin}/l/${link.slug}` : null;
                return (
                  <tr
                    key={app.id}
                    className="border-b border-black/5 transition last:border-0 hover:bg-black/[0.015]"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-zinc-900">
                        {app.company_name}
                      </div>
                      {app.role && (
                        <div className="text-xs text-zinc-500">{app.role}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusSelect
                        id={app.id}
                        status={app.status as ApplicationStatus}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {shortUrl ? (
                        <div className="flex items-center gap-2">
                          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                            /l/{link!.slug}
                          </code>
                          <CopyButton value={shortUrl} />
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">aucun</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold">{stats?.human ?? 0}</span>
                      {stats && stats.bot > 0 && (
                        <span
                          className="ml-1 text-xs text-zinc-400"
                          title={`${stats.bot} ouverture(s) automatique(s) (robots)`}
                        >
                          +{stats.bot}🤖
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {formatDate(stats?.last ?? null)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/a/${app.id}`}
                        className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
                      >
                        Détail →
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
  return (
    <details className="group">
      <summary className="btn-primary cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="transition group-open:rotate-45">+</span>
        <span>Nouvelle candidature</span>
      </summary>
      <div className="card mt-4 p-6">
        <form action={createApplication} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">
              Entreprise *
            </label>
            <input name="company_name" required className="input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Poste</label>
            <input name="role" className="input" placeholder="Alternance…" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600">
              Lien à traquer (destination)
            </label>
            <input
              name="destination_url"
              className="input"
              placeholder="ex: mon-portfolio.com  ou  lien Google Drive du CV"
            />
            <p className="text-xs text-zinc-400">
              Un lien traqué unique sera généré et redirigera vers cette adresse.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Contact</label>
            <input name="contact_name" className="input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">
              Email du contact
            </label>
            <input name="contact_email" type="email" className="input" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Notes</label>
            <textarea name="notes" rows={2} className="input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Créer la candidature
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs text-zinc-400">Statuts :</span>
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
