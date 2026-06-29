"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Candidatures", match: ["/dashboard/a"] },
  { href: "/dashboard/publications", label: "Publications" },
  { href: "/dashboard/visites", label: "Visites" },
  { href: "/dashboard/parametres", label: "Réglages" },
];

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string, match?: string[]): boolean {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        (match ?? []).some((m) => pathname.startsWith(m))
      );
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = isActive(l.href, l.match);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
