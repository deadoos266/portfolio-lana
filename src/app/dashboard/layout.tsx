import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { logout } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-semibold">
              Candidatures
            </Link>
            <Link
              href="/dashboard/visites"
              className="text-zinc-500 transition hover:text-zinc-900"
            >
              Visites
            </Link>
            <Link
              href="/dashboard/parametres"
              className="text-zinc-500 transition hover:text-zinc-900"
            >
              Réglages
            </Link>
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
