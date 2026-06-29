import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisitTracker } from "@/components/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}
