"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export interface ParcoursCard {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  slug: string | null;
}

interface ParcoursCarouselProps {
  cards: ReadonlyArray<ParcoursCard>;
}

export function ParcoursCarousel({ cards }: ParcoursCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  function scrollBy(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / 4; // largeur d'une carte (4 visibles)
    el.scrollBy({
      left: direction === "right" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {/* Pistes de cartes */}
      <div
        ref={scrollerRef}
        className="hide-scrollbar -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-2 pb-2"
      >
        {cards.map((card) => (
          <ParcoursCardView key={card.id} card={card} />
        ))}
      </div>

      {/* Flèche gauche (apparaît seulement si on peut revenir) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy("left")}
          aria-label="Précédent"
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-3 text-zinc-700 shadow-md transition hover:bg-zinc-50 hover:text-zinc-900 sm:flex"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Flèche droite (toujours visible tant qu'il reste à découvrir) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy("right")}
          aria-label="Suivant"
          className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-3 text-zinc-700 shadow-md transition hover:bg-zinc-50 hover:text-zinc-900"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function ParcoursCardView({ card }: { card: ParcoursCard }) {
  const inner = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-sky-50">
        {card.image_url ? (
          <Image
            src={card.image_url}
            alt={card.title}
            fill
            sizes="(max-width: 640px) 80vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M21 15l-5-5-9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="text-base font-semibold leading-snug text-zinc-900"
          style={{ fontFamily: "var(--font-cardTitle)" }}
        >
          {card.title}
        </h3>
        {card.description && (
          <p
            className="mt-2 line-clamp-3 text-sm text-zinc-600"
            style={{ fontFamily: "var(--font-cardDescription)" }}
          >
            {card.description}
          </p>
        )}
      </div>
    </article>
  );

  // Priorité : page interne /parcours/<slug>. Repli : lien externe si défini.
  const wrapperClass = "w-[80%] shrink-0 snap-start sm:w-[calc(25%-12px)]";

  if (card.slug) {
    return (
      <Link href={`/parcours/${card.slug}`} className={wrapperClass}>
        {inner}
      </Link>
    );
  }
  if (card.link_url) {
    return (
      <a
        href={card.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClass}
      >
        {inner}
      </a>
    );
  }
  return <div className={wrapperClass}>{inner}</div>;
}
