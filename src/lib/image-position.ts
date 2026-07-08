/**
 * Réglages de cadrage d'une image :
 * - zoom : 100 (taille normale) à 250 (fortement agrandie)
 * - posX : 0 (gauche) à 100 (droite), 50 = centré
 * - posY : 0 (haut) à 100 (bas), 50 = centré
 */
export interface ImagePosition {
  zoom: number;
  posX: number;
  posY: number;
}

export const DEFAULT_POSITION: ImagePosition = {
  zoom: 100,
  posX: 50,
  posY: 50,
};

function num(input: unknown, fallback: number, min: number, max: number): number {
  const n = typeof input === "string" ? Number(input) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function normalizePosition(input: {
  zoom?: unknown;
  posX?: unknown;
  posY?: unknown;
}): ImagePosition {
  return {
    zoom: num(input.zoom, DEFAULT_POSITION.zoom, 100, 250),
    posX: num(input.posX, DEFAULT_POSITION.posX, 0, 100),
    posY: num(input.posY, DEFAULT_POSITION.posY, 0, 100),
  };
}

/** Styles CSS à appliquer à une <Image> pour respecter le cadrage. */
export function positionStyle(pos: ImagePosition): React.CSSProperties {
  return {
    objectFit: "cover",
    objectPosition: `${pos.posX}% ${pos.posY}%`,
    transform: pos.zoom === 100 ? undefined : `scale(${pos.zoom / 100})`,
    transformOrigin: `${pos.posX}% ${pos.posY}%`,
  };
}
