import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrigin } from "@/lib/origin";
import { CopyButton } from "@/components/CopyButton";
import { StatusSelect } from "@/components/StatusSelect";
import { DeleteOpenButton } from "@/components/DeleteOpenButton";
import { deleteApplication } from "../../actions";
import type {
  Application,
  ApplicationStatus,
  LinkOpen,
  TrackedLink,
} from "@/lib/types";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function place(open: LinkOpen): string {
  const parts = [open.city, open.country].filter(Boolean);
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

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const origin = await getOrigin();

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!application) notFound();
  const app = application as Application;

  const { data: links } = await supabase
    .from("tracked_links")
    .select("*")
    .eq("application_id", id);

  const link = (links?.[0] ?? null) as TrackedLink | null;

  let opens: LinkOpen[] = [];
  if (link) {
    const { data } = await supabase
      .from("link_opens")
      .select("*")
      .eq("link_id", link.id)
      .order("opened_at", { ascending: false });
    opens = (data ?? []) as LinkOpen[];
  }

  const uniqueVisitors = new Set(opens.map((o) => o.ip).filter(Boolean)).size;
  const shortUrl = link ? `${origin}/l/${link.slug}` : null;

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>

      {/* En-tête candidature */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{app.company_name}</h1>
          {app.role && <p className="text-zinc-500">{app.role}</p>}
        </div>
        <StatusSelect id={app.id} status={app.status as ApplicationStatus} />
      </div>

      {/* Infos contact / notes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard label="Contact" value={app.contact_name} />
        <InfoCard label="Email" value={app.contact_email} />
        <InfoCard label="Candidaté le" value={app.applied_at} />
        <InfoCard label="Notes" value={app.notes} />
      </div>

      {/* Lien traqué */}
      {shortUrl && link && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Lien à envoyer
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-zinc-100 px-3 py-2 text-sm">
              {shortUrl}
            </code>
            <CopyButton value={shortUrl} />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Redirige vers&nbsp;
            <span className="break-all">{link.destination_url}</span>
          </p>
        </div>
      )}

      {/* Stats ouvertures */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Ouvertures totales" value={opens.length} />
        <StatCard label="Visiteurs uniques" value={uniqueVisitors} />
        <StatCard
          label="Dernière ouverture"
          value={opens[0] ? formatDateTime(opens[0].opened_at) : "—"}
          small
        />
      </div>

      {/* Journal des ouvertures */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Journal des ouvertures</h2>
        {opens.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            Aucune ouverture enregistrée pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Lieu</th>
                  <th className="px-4 py-3">Appareil</th>
                  <th className="px-4 py-3">Navigateur</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {opens.map((open) => (
                  <tr key={open.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(open.opened_at)}
                    </td>
                    <td className="px-4 py-3">{place(open)}</td>
                    <td className="px-4 py-3 capitalize">
                      {open.device_type ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {open.browser ?? "—"}
                      {open.os ? (
                        <span className="text-zinc-400"> · {open.os}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {source(open.referrer)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteOpenButton id={open.id} applicationId={app.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suppression */}
      <form
        action={deleteApplication.bind(null, app.id)}
        className="border-t border-zinc-200 pt-6"
      >
        <button
          type="submit"
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Supprimer cette candidature
        </button>
      </form>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-900">{value || "—"}</p>
    </div>
  );
}

function StatCard({
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
