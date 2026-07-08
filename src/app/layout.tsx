import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { VisitTracker } from "@/components/VisitTracker";
import { getSetting } from "@/lib/settings";

/**
 * Couleurs du site. La plupart sont fixées dans le code (l'ancienne page
 * dashboard "Couleurs" a été retirée) — pour les changer, modifie les
 * valeurs ci-dessous directement. `bg_main`/`bg_hero` restent éditables
 * depuis dashboard > Mon site > Fond, donc lues dynamiquement.
 */
const FIXED_COLORS = {
  textTitles: "#6A2020",
  textContactTitle: "#1D1D1F",
  textName: "#751E15",
  textBody: "#3F3F46",
  accentWarm: "#550C0C",
  accentCool: "#C9A876",
  haloWarm: "#FEF6E4",
  haloCool: "#EAE0CD",
  buttonBg: "#000000",
  buttonText: "#FFFFFF",
};
const DEFAULT_BG_MAIN = "#FBF9F4";
const DEFAULT_BG_HERO = "#FAFAF9";

function buildColorsCss(bgMain: string, bgHero: string): string {
  return `:root {
  --c-text-titles: ${FIXED_COLORS.textTitles};
  --c-text-contact-title: ${FIXED_COLORS.textContactTitle};
  --c-text-name: ${FIXED_COLORS.textName};
  --c-text-body: ${FIXED_COLORS.textBody};
  --c-accent-warm: ${FIXED_COLORS.accentWarm};
  --c-accent-cool: ${FIXED_COLORS.accentCool};
  --c-bg-main: ${bgMain};
  --c-bg-hero: ${bgHero};
  --c-halo-warm: ${FIXED_COLORS.haloWarm};
  --c-halo-cool: ${FIXED_COLORS.haloCool};
  --c-button-bg: ${FIXED_COLORS.buttonBg};
  --c-button-text: ${FIXED_COLORS.buttonText};
}`;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police "titre" chaleureuse et élégante (esprit éditorial) pour le site public.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lana-herve.vercel.app",
  ),
  title: "Lana Hervé",
  description: "Portfolio de Lana Hervé, journaliste.",
  openGraph: {
    title: "Lana Hervé — Journaliste",
    description: "Portfolio de Lana Hervé, journaliste.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lana Hervé — Journaliste",
    description: "Portfolio de Lana Hervé, journaliste.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [bgMain, bgHero] = await Promise.all([
    getSetting("bg_main"),
    getSetting("bg_hero"),
  ]);
  const themeCss = buildColorsCss(
    bgMain ?? DEFAULT_BG_MAIN,
    bgHero ?? DEFAULT_BG_HERO,
  );

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}
