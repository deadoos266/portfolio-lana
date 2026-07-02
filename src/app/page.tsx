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

// Toutes les couleurs viennent des variables CSS injectées par le layout,
// elles-mêmes issues de la palette configurable par Lana (dashboard > Couleurs).
const softGradient = "linear-gradient(135deg, var(--c-halo-warm), var(--c-halo-cool))";
const visionBg = "linear-gradient(to bottom, var(--c-bg-main), color-mix(in oklab, var(--c-halo-cool) 40%, var(--c-bg-main)))";
const contactBg = "linear-gradient(to bottom, var(--c-bg-main), color-mix(in oklab, var(--c-halo-warm) 40%, var(--c-bg-main)))";

export default async function Home() {
  const supabase = createAdminClient();

  const [
    banner,
    photomaton,
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
    getSetting("photomaton_url"),
    getSetting("hero_subtitle"),
    getSetting("hero_intro"),
    getSetting("projet_text"),
    getSetting("vision_text"),
    getSetting("contact_email"),
    getSetting("contact_phone"),
    getSetting("cv_url"),
    supabase
      .from("parcours_cards")
      .select("id, title, description, image_url, link_url, slug")
      .order("display_order", { ascending: true }),
  ]);

  const cards = (cardsData ?? []) as ParcoursCard[];
  const contactEmail = email || DEFAULTS.email;

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--c-bg-main)", color: "var(--c-text-body)" }}
    >
      {/* ---------- En-tête + bandeau ---------- */}
      <header className="relative">
        {/* Bandeau PORTFOLIO — grand format style Apple */}
        <div
          className="relative h-[60vh] min-h-[420px] w-full overflow-hidden sm:h-[70vh]"
          style={{ background: "var(--c-bg-hero)" }}
        >
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
                className="font-display font-bold tracking-tight"
                style={{
                  fontSize: "clamp(4rem, 14vw, 12rem)",
                  color: "var(--c-text-body)",
                }}
              >
                PORTFOLIO
              </span>
            </div>
          )}
        </div>

        {/* Sous-titre nom + phrase */}
        <div
          className="border-y border-zinc-100 px-6 py-4 text-center"
          style={{ background: "var(--c-bg-main)" }}
        >
          <p
            className="font-display text-lg"
            style={{ color: "var(--c-text-name)" }}
          >
            Lana Hervé
          </p>
          <p
            className="mx-auto mt-1 max-w-2xl text-sm font-medium"
            style={{ color: "var(--c-text-body)" }}
          >
            {subtitle || DEFAULTS.subtitle}
          </p>
        </div>

        {/* Menu de navigation */}
        <nav
          className="sticky top-0 z-30 border-b border-zinc-100 backdrop-blur-md"
          style={{
            background:
              "color-mix(in oklab, var(--c-bg-main) 85%, transparent)",
          }}
        >
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
        <div
          className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{ background: "var(--c-halo-warm)" }}
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{ background: "var(--c-halo-cool)" }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
          {/* Photomaton (une seule photo verticale longue) */}
          <div className="mx-auto md:mx-0">
            <div
              className="overflow-hidden rounded-md border-[3px] bg-zinc-100 shadow-md"
              style={{ borderColor: "var(--c-button-bg)" }}
            >
              {photomaton ? (
                <Image
                  src={photomaton}
                  alt="Photomaton de Lana"
                  width={220}
                  height={660}
                  priority
                  className="h-[360px] w-[120px] object-cover sm:h-[540px] sm:w-[180px]"
                />
              ) : (
                <div
                  className="flex h-[360px] w-[120px] items-center justify-center text-xs text-zinc-400 sm:h-[540px] sm:w-[180px]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--c-halo-warm), var(--c-halo-cool))",
                  }}
                >
                  Photomaton
                </div>
              )}
            </div>
          </div>

          {/* Colonne texte de présentation */}
          <div className="space-y-4">
            <p
              className="font-display text-2xl leading-relaxed md:text-[1.6rem]"
              style={{ color: "var(--c-text-body)" }}
            >
              {renderInline(intro || DEFAULTS.intro)}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`mailto:${contactEmail}`}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
                style={{
                  background: "var(--c-button-bg)",
                  color: "var(--c-button-text)",
                }}
              >
                Me contacter
              </a>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
                  style={{
                    background:
                      "color-mix(in oklab, var(--c-accent-warm) 15%, var(--c-bg-main))",
                    borderColor:
                      "color-mix(in oklab, var(--c-accent-warm) 40%, transparent)",
                    color: "var(--c-accent-warm)",
                  }}
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
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              color: "var(--c-text-body)",
            }}
            className="space-y-4 text-base leading-relaxed md:text-lg"
          >
            {(projet || DEFAULTS.projet)
              .split("\n")
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{renderInline(p)}</p>
              ))}
          </div>

          {/* Carte + synopsis (placeholder en attendant Lana) */}
          <div
            className="overflow-hidden rounded-2xl border border-zinc-100 p-6 shadow-sm"
            style={{ background: softGradient }}
          >
            <p
              className="text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: "var(--c-accent-warm)" }}
            >
              Carte &amp; synopsis
            </p>
            <p
              className="font-display mt-3 text-xl"
              style={{ color: "var(--c-text-body)" }}
            >
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
        backgroundStyle={{ background: visionBg }}
      >
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          {(vision || DEFAULTS.vision)
            .split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p
                key={i}
                className="font-display text-xl leading-relaxed md:text-2xl"
                style={{ color: "var(--c-text-body)" }}
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
      <section
        className="border-t border-zinc-100"
        style={{ background: contactBg }}
      >
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontStyle: "italic",
              textDecoration: "underline",
              textUnderlineOffset: "6px",
              color: "var(--c-text-contact-title)",
            }}
            className="text-3xl tracking-tight"
          >
            Contact
          </h2>
          <div
            className="mt-5 space-y-2"
            style={{ color: "var(--c-text-body)" }}
          >
            <p>
              <span className="text-zinc-500">Adresse mail :</span>{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium underline-offset-4 hover:underline"
                style={{ color: "var(--c-text-body)" }}
              >
                {contactEmail}
              </a>
            </p>
            {phone && (
              <p>
                <span className="text-zinc-500">Numéro de téléphone :</span>{" "}
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="font-medium underline-offset-4 hover:underline"
                  style={{ color: "var(--c-text-body)" }}
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
  backgroundStyle?: React.CSSProperties;
  children: React.ReactNode;
}

function Section({ id, title, backgroundStyle, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20" style={backgroundStyle}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            fontStyle: "italic",
            textDecoration: "underline",
            textUnderlineOffset: "6px",
            color: "var(--c-text-titles)",
          }}
          className="mb-10 text-3xl tracking-tight md:text-4xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

