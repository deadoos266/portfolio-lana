import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
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
      {/* ============================================================
          ENTÊTE
          ============================================================ */}
      <header>
        {/* Bandeau PORTFOLIO — full bleed, ultra-impactant */}
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

        {/* Bandeau identité — très épuré */}
        <div className="border-b border-zinc-100 bg-white px-6 py-10 text-center">
          <p className="font-display text-2xl text-pink-400 sm:text-3xl">
            Lana Hervé
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-zinc-600 sm:text-base">
            {subtitle || DEFAULTS.subtitle}
          </p>
        </div>

        {/* Menu sticky */}
        <nav className="sticky top-0 z-30 border-b border-zinc-100 bg-white/85 backdrop-blur-xl">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 py-4 text-sm">
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

      {/* ============================================================
          PRÉSENTATION : 3 photos + texte
          ============================================================ */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-28 md:grid-cols-[auto_1fr] md:items-center md:gap-24 md:py-36">
          {/* Pellicule de 3 photos */}
          <div className="flex flex-row gap-4 md:flex-col md:gap-5">
            {photos.length > 0
              ? photos.map((src, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-md border-[3px] border-zinc-900 bg-zinc-100 shadow-lg"
                  >
                    <Image
                      src={src}
                      alt={`Lana ${i + 1}`}
                      width={200}
                      height={250}
                      className="h-36 w-28 object-cover sm:h-52 sm:w-40"
                      priority={i === 0}
                    />
                  </div>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <PhotoPlaceholder key={i} />
                ))}
          </div>

          {/* Texte : très grand, aéré */}
          <div className="space-y-8">
            <p
              className="font-display leading-[1.3] text-zinc-900"
              style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)" }}
            >
              {intro || DEFAULTS.intro}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`mailto:${contactEmail}`}
                className="rounded-full bg-zinc-900 px-7 py-3.5 text-base font-medium text-white transition hover:bg-black"
              >
                Me contacter
              </a>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-pink-200 bg-pink-50 px-7 py-3.5 text-base font-medium text-pink-700 transition hover:bg-pink-100"
                >
                  Mon CV
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MON PROJET PROFESSIONNEL
          ============================================================ */}
      <Section id="projet" title="Mon projet professionnel">
        <div className="grid gap-16 md:grid-cols-[1.3fr_1fr] md:items-start md:gap-20">
          <div className="space-y-6 text-lg leading-relaxed text-zinc-700 md:text-xl md:leading-[1.7]">
            {(projet || DEFAULTS.projet)
              .split("\n")
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>

          {/* Carte + synopsis */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 to-sky-50 p-10">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-pink-400">
              Carte &amp; synopsis
            </p>
            <p className="font-display mt-5 text-2xl text-zinc-700">
              Espace réservé
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Ici viendra ma carte et son synopsis, très bientôt.
            </p>
          </div>
        </div>
      </Section>

      {/* ============================================================
          MA VISION DU JOURNALISME
          ============================================================ */}
      <Section
        id="vision"
        title="Ma vision du journalisme"
        background="bg-gradient-to-b from-white via-sky-50/30 to-white"
      >
        <div className="mx-auto max-w-4xl">
          {(vision || DEFAULTS.vision)
            .split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p
                key={i}
                className="font-display text-center leading-[1.4] text-zinc-800"
                style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.5rem)" }}
              >
                «&nbsp;{p}&nbsp;»
              </p>
            ))}
        </div>
      </Section>

      {/* ============================================================
          MON PARCOURS — carrousel
          ============================================================ */}
      <Section id="parcours" title="Mon parcours">
        {cards.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            Mes étapes arrivent bientôt.
          </p>
        ) : (
          <ParcoursCarousel cards={cards} />
        )}
      </Section>

      {/* ============================================================
          CONTACT
          ============================================================ */}
      <section className="border-t border-zinc-100 bg-gradient-to-b from-white to-pink-50/40">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h2
            className="font-display tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.75rem)" }}
          >
            Travaillons ensemble
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-zinc-600">
            Une question, une proposition d&apos;alternance ? Contactez-moi.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base">
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

      <footer className="py-10 text-center text-xs text-zinc-400">
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
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div className="mb-16">
          <h2
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontWeight: 700,
              textDecoration: "underline",
              textUnderlineOffset: "8px",
              color: "#f9a8d4",
              fontSize: "clamp(2rem, 3.6vw, 3.25rem)",
            }}
            className="tracking-tight"
          >
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="flex h-36 w-28 items-center justify-center rounded-md border-[3px] border-zinc-900 bg-gradient-to-br from-pink-50 to-sky-50 text-xs text-zinc-400 shadow-lg sm:h-52 sm:w-40">
      Photo
    </div>
  );
}
