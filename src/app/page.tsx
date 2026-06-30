import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { MEDIA_LABELS, type MediaType, type Publication } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  tagline: "Journaliste — à la recherche d'une alternance",
  intro:
    "Bonjour, moi c'est Lana. Passionnée par le journalisme et les histoires qui comptent, je cherche une alternance pour mettre ma curiosité et ma plume au service d'une rédaction.",
  email: "lanaherve5@icloud.com",
};

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function Home() {
  const supabase = createAdminClient();

  const [photo, tagline, intro, email, phone, cvUrl, { data: pubData }] =
    await Promise.all([
      getSetting("profile_photo_url"),
      getSetting("tagline"),
      getSetting("intro_text"),
      getSetting("contact_email"),
      getSetting("contact_phone"),
      getSetting("cv_url"),
      supabase
        .from("publications")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .order("published_date", { ascending: false }),
    ]);

  const publications = (pubData ?? []) as Publication[];
  const contactEmail = email || DEFAULTS.email;

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        {/* halos pastel doux */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:py-28">
          <PhotoOrPlaceholder photo={photo} />

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-pink-400">
            Portfolio
          </p>
          <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
            Lana Hervé
          </h1>
          <p className="mt-4 text-lg text-zinc-500">{tagline || DEFAULTS.tagline}</p>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-zinc-600">
            {intro || DEFAULTS.intro}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${contactEmail}`}
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              Me contacter
            </a>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-pink-200 bg-pink-50 px-6 py-3 text-sm font-medium text-pink-700 transition hover:bg-pink-100"
              >
                Mon CV
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="rounded-full border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
              >
                {phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Publications ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-display mb-8 text-3xl font-semibold tracking-tight">
          Mon travail
        </h2>

        {publications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center text-zinc-500">
            Mes articles et reportages arrivent très bientôt. ✨
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publications.map((p) => (
              <PublicationCard key={p.id} publication={p} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Contact ---------- */}
      <section className="border-t border-zinc-100 bg-gradient-to-b from-white to-pink-50/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Travaillons ensemble
          </h2>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            Une question, une proposition d&apos;alternance ? Écris-moi, je
            réponds avec plaisir.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              {contactEmail}
            </a>
            {phone && <span className="text-zinc-600">{phone}</span>}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Lana Hervé
      </footer>
    </main>
  );
}

function PhotoOrPlaceholder({ photo }: { photo: string | null }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt="Lana Hervé"
        width={160}
        height={160}
        priority
        className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-4 ring-pink-100"
      />
    );
  }
  return (
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-sky-100 ring-4 ring-pink-100">
      <span className="font-display text-4xl font-semibold text-zinc-400">
        LH
      </span>
    </div>
  );
}

function PublicationCard({ publication }: { publication: Publication }) {
  const p = publication;
  const inner = (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {p.cover_image_url ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={p.cover_image_url}
            alt={p.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-pink-50 to-sky-50" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="rounded-full bg-pink-50 px-2 py-0.5 font-medium text-pink-500">
            {MEDIA_LABELS[p.media_type as MediaType] ?? p.media_type}
          </span>
          {p.outlet && <span>{p.outlet}</span>}
          {p.published_date && <span>· {formatDate(p.published_date)}</span>}
        </div>
        <h3 className="font-display mt-2 text-lg font-semibold leading-snug text-zinc-900">
          {p.title}
        </h3>
        {p.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{p.excerpt}</p>
        )}
        {p.url && (
          <span className="mt-4 inline-block text-sm font-medium text-sky-500 transition group-hover:text-sky-600">
            Découvrir →
          </span>
        )}
      </div>
    </article>
  );

  if (p.url) {
    return (
      <a href={p.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
