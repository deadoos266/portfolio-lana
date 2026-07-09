"use client";

import { useEffect, useState } from "react";

interface SectionsNavProps {
  sections: ReadonlyArray<{ id: string; label: string }>;
}

/**
 * Petite navigation ancrée, fixée en haut de l'écran au scroll. Le nom de
 * la rubrique actuellement consultée passe en bordeaux (couleur des grands
 * titres du site), les autres restent gris — via IntersectionObserver, mis
 * à jour aussi bien en scrollant qu'en cliquant un lien.
 */
export function SectionsNav({ sections }: SectionsNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topMost.target.id);
      },
      // Zone de détection : une bande fine juste sous la barre fixe.
      { rootMargin: "-72px 0px -75% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      className="sticky top-0 z-30 border-y border-zinc-100 backdrop-blur-md"
      style={{
        background: "color-mix(in oklab, var(--c-bg-main) 85%, transparent)",
      }}
    >
      <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-3 text-sm">
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`font-medium transition hover:text-zinc-900 ${
                  isActive ? "" : "text-zinc-500"
                }`}
                style={isActive ? { color: "var(--c-text-titles)" } : undefined}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
