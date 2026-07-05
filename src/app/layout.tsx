import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { VisitTracker } from "@/components/VisitTracker";
import { getTheme, themeToCssVariables } from "@/lib/theme";
import { getFonts, fontsToCssVariables, googleFontsUrl } from "@/lib/fonts";

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
  const [theme, fonts] = await Promise.all([getTheme(), getFonts()]);
  const themeCss = themeToCssVariables(theme);
  const fontsCss = fontsToCssVariables(fonts);
  const gFontsHref = googleFontsUrl(fonts);

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {gFontsHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={gFontsHref} />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: themeCss + "\n" + fontsCss }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}
