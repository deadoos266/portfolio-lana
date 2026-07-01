import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { renderInline } from "@/lib/inline-markdown";
import { ParcoursCarousel, type ParcoursCard } from "@/components/ParcoursCarousel";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  subtitle:
    "Entrée en Master 1 Journalisme, spécialisation « Presse Magazine » à l'IEJ (Paris) dès Septembre 2026.",
  intro:
    "Curieuse et passionnée par les histoires qui font vibrer, je m'apprête à entrer en Master 1 Journalisme à l'IEJ. À travers ce portfolio, je partage mon parcours artistique et scolaire, mes premiers pas en rédaction et la vision du journalisme qui m'anime.",
  projet:
    "Mon projet professionnel se construit autour d'une conviction : raconter le monde en restant proche des gens. La presse magazine est pour moi un terrain idéal pour explorer en profondeur les sujets de société, de culture et d'art qui me touchent.",
  vision:
    "Je crois en un journalisme qui prend le temps, qui écoute, qui regarde, qui met en lumière les voix qu'on entend peu. Un journalisme honnête, sensible et exigeant — c'est celui que je veux pratiquer.",
  email: "lanaherve5@icloud.com",
};

const NAV = [
  { id: "projet", label: "Mon projet professionnel" },
  { id: "vision", label: "Ma vision du journalisme" },
  { id: "parcours", label: "Mon parcours" },
];

export default async function Home() {
  const supabase = createAdminClient();

  const [
    banner,
    photo1,
    photo2,
    photo3,
    subtitle,
    intro,
    projet,
    vision,
    email,
    phone,
    cvUrl,
    { data: cardsData },
  ] = await Promise.all([
    getSetting("banner_url"),
    getSetting("photo_1_url"),
    getSetting("photo_2_url"),
    getSetting("photo_3_url"),
    getSetting("hero_subtitle"),
    getSetting("hero_intro"),
    getSetting("projet_text"),
    getSetting("vision_text"),
    getSetting("contact_email"),
    getSetting("contact_phone"),
    getSetting("cv_url"),
    supabase
      .from("parcours_cards")
      .select("id, title, description, image_url, link_url")
      .order("display_order", { ascending: true }),
  ]);

  const cards = (cardsData ?? []) as ParcoursCard[];
  const photos = [photo1, photo2, photo3].filter(Boolean) as string[];
  const contactEmail = email || DEFAULTS.email;

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* ---------- En-tête + bandeau ---------- */}
      <header className="relative">
        {/* Bandeau PORTFOLIO — grand format style Apple */}
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-stone-50 sm:h-[70vh]">
          {banner ? (
            <Image
              src={banner}
              alt="Portfolio — Lana Hervé"
              fill
              priority
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span
                className="font-display font-bold tracking-tight text-zinc-900"
                style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
              >
                PORTFOLIO
              </span>
            </div>
          )}
        </div>

        {/* Sous-titre rose */}
        <div className="border-y border-zinc-100 bg-white px-6 py-4 text-center">
          <p className="font-display text-lg text-pink-400">Lana Hervé</p>
          <p className="mx-auto mt-1 max-w-2xl text-sm font-medium text-zinc-700">
            {subtitle || DEFAULTS.subtitle}
          </p>
        </div>

        {/* Menu de navigation */}
        <nav className="sticky top-0 z-30 border-b border-zinc-100 bg-white/85 backdrop-blur-md">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-3 text-sm">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="font-medium text-zinc-500 transition hover:text-zinc-900"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ---------- Présentation (photos + texte) ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-pink-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
          {/* Colonne photos (les 3 en pellicule verticale) */}
          <div className="flex flex-row gap-3 md:flex-col md:gap-4">
            {photos.length > 0
              ? photos.map((src, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-md border-[3px] border-zinc-900 bg-zinc-100 shadow-md"
                  >
                    <Image
                      src={src}
                      alt={`Lana ${i + 1}`}
                      width={180}
                      height={220}
                      className="h-32 w-24 object-cover sm:h-44 sm:w-36"
                      priority={i === 0}
                    />
                  </div>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <PhotoPlaceholder key={i} />
                ))}
          </div>

          {/* Colonne texte de présentation */}
          <div className="space-y-4">
            <p className="font-display text-2xl leading-relaxed text-zinc-800 md:text-[1.6rem]">
              {renderInline(intro || DEFAULTS.intro)}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`mailto:${contactEmail}`}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black"
              >
                Me contacter
              </a>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-pink-200 bg-pink-50 px-5 py-2.5 text-sm font-medium text-pink-700 transition hover:bg-pink-100"
                >
                  Mon CV
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Mon projet professionnel ---------- */}
      <Section id="projet" title="Mon projet professionnel">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-start md:gap-12">
          <div
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
            className="space-y-4 text-xs leading-relaxed text-zinc-700 md:text-sm"
          >
            {(projet || DEFAULTS.projet)
              .split("\n")
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{renderInline(p)}</p>
              ))}
          </div>

          {/* Carte + synopsis (placeholder en attendant Lana) */}
          <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-gradient-to-br from-pink-50 to-sky-50 p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">
              Carte &amp; synopsis
            </p>
            <p className="font-display mt-3 text-xl text-zinc-700">
              Espace réservé
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Ici viendra ta carte et son synopsis, dès que tu seras prête.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Ma vision du journalisme ---------- */}
      <Section
        id="vision"
        title="Ma vision du journalisme"
        background="bg-gradient-to-b from-white to-sky-50/40"
      >
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          {(vision || DEFAULTS.vision)
            .split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p
                key={i}
                className="font-display text-xl leading-relaxed text-zinc-700 md:text-2xl"
              >
                « {renderInline(p)} »
              </p>
            ))}
        </div>
      </Section>

      {/* ---------- Mon parcours (carrousel 7 cartes) ---------- */}
      <Section id="parcours" title="Mon parcours">
        {cards.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            Mes étapes arrivent bientôt.
          </p>
        ) : (
          <ParcoursCarousel cards={cards} />
        )}
      </Section>

      {/* ---------- Contact ---------- */}
      <section className="border-t border-zinc-100 bg-gradient-to-b from-white to-pink-50/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontStyle: "italic",
              textDecoration: "underline",
              textUnderlineOffset: "6px",
            }}
            className="text-3xl tracking-tight"
          >
            Contact
          </h2>
          <div className="mt-5 space-y-2 text-zinc-800">
            <p>
              <span className="text-zinc-500">Adresse mail :</span>{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-zinc-900 underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </p>
            {phone && (
              <p>
                <span className="text-zinc-500">Numéro de téléphone :</span>{" "}
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  {phone}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Lana Hervé
      </footer>
    </main>
  );
}

interface SectionProps {
  id: string;
  title: string;
  background?: string;
  children: React.ReactNode;
}

function Section({ id, title, background, children }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-20 ${background ?? ""}`}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-center gap-4">
          <h2
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontWeight: 700,
              fontStyle: "italic",
              textDecoration: "underline",
              textUnderlineOffset: "6px",
              color: "#f9a8d4", // rose pastel
            }}
            className="text-3xl tracking-tight md:text-4xl"
          >
            {title}
          </h2>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
        {children}
      </div>
    </section>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="flex h-32 w-24 items-center justify-center rounded-md border-[3px] border-zinc-900 bg-gradient-to-br from-pink-50 to-sky-50 text-xs text-zinc-400 sm:h-44 sm:w-36">
      Photo
    </div>
  );
}
