import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
          Portfolio
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900 sm:text-5xl">
          Svetlana
        </h1>
        <p className="max-w-md text-zinc-500">Site en cours de construction.</p>
      </div>
      <Link
        href="/login"
        className="text-xs text-zinc-400 underline-offset-4 hover:text-zinc-600 hover:underline"
      >
        Espace privé
      </Link>
    </main>
  );
}
