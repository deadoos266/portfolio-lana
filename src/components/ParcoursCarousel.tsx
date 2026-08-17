"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { aspectClass, type ImageAspect } from "@/lib/image-aspect";
import { normalizePosition, positionStyle } from "@/lib/image-position";

export interface ParcoursCard {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  slug: string | null;
  image_aspect: ImageAspect | null;
  image_zoom: number | null;
  image_pos_x: number | null;
  image_pos_y: number | null;
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

      {/* Les deux flèches restent TOUJOURS affichées, celle qui ne sert pas
          étant grisée : on voit ainsi d'emblée que le contenu défile, et la
          mise en page ne saute pas quand une flèche apparaît ou disparaît. */}
      <CarouselArrow
        direction="left"
        disabled={!canScrollLeft}
        onClick={() => scrollBy("left")}
      />
      <CarouselArrow
        direction="right"
        disabled={!canScrollRight}
        onClick={() => scrollBy("right")}
      />
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Précédent" : "Suivant"}
      className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-3 text-zinc-700 shadow-md transition ${
        isLeft ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      } ${
        disabled
          ? "cursor-not-allowed opacity-30"
          : "hover:bg-zinc-50 hover:text-zinc-900"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d={isLeft ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ParcoursCardView({ card }: { card: ParcoursCard }) {
  const inner = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`relative ${aspectClass(card.image_aspect)} overflow-hidden bg-gradient-to-br from-pink-50 to-sky-50`}
      >
        {card.image_url ? (
          <Image
            src={card.image_url}
            alt={card.title}
            fill
            sizes="(max-width: 640px) 80vw, 25vw"
            className="transition duration-500 group-hover:scale-105"
            style={positionStyle(
              normalizePosition({
                zoom: card.image_zoom,
                posX: card.image_pos_x,
                posY: card.image_pos_y,
              }),
            )}
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
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {card.title}
        </h3>
        {card.description && (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
            {card.description}
          </p>
        )}
      </div>
    </article>
  );

  const wrapperClass = "w-[80%] shrink-0 snap-start sm:w-[calc(25%-12px)]";

  if (card.slug) {
    return (
      <Link href={`/parcours/${card.slug}`} className={wrapperClass}>
        {inner}
      </Link>
    );
  }
  return <div className={wrapperClass}>{inner}</div>;
}
