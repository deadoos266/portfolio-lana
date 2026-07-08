import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { VisitTracker } from "@/components/VisitTracker";

/**
 * Couleurs du site. Fixées dans le code (l'ancienne page dashboard
 * "Couleurs" a été retirée) — pour changer une couleur, modifie les
 * valeurs ci-dessous directement.
 */
const SITE_COLORS_CSS = `:root {
  --c-text-titles: #6A2020;
  --c-text-contact-title: #1D1D1F;
  --c-text-name: #751E15;
  --c-text-body: #3F3F46;
  --c-accent-warm: #550C0C;
  --c-accent-cool: #C9A876;
  --c-bg-main: #FBF9F4;
  --c-bg-hero: #FAFAF9;
  --c-halo-warm: #FEF6E4;
  --c-halo-cool: #EAE0CD;
  --c-button-bg: #000000;
  --c-button-text: #FFFFFF;
}`;

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: SITE_COLORS_CSS }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}
