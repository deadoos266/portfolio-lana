import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { logout } from "./actions";
import { NavLinks } from "./NavLinks";

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
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Voir le site ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="btn-ghost">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
