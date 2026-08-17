import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { NavLinks } from "./NavLinks";

// Ceinture et bretelles avec robots.txt : l'espace de gestion ne doit
// jamais remonter dans un moteur de recherche.
export const metadata: Metadata = {
  title: "Espace de gestion",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f5f5f7]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <NavLinks />
          <Link href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Voir le site ↗
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
