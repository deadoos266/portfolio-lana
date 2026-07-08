export type ImageAspect = "square" | "landscape" | "portrait";

export const IMAGE_ASPECT_OPTIONS: ReadonlyArray<{
  value: ImageAspect;
  label: string;
}> = [
  { value: "square", label: "Carré (1:1)" },
  { value: "landscape", label: "Paysage (3:2)" },
  { value: "portrait", label: "Portrait (3:4)" },
];

/** Classe Tailwind arbitraire pour appliquer le ratio à un conteneur. */
export function aspectClass(value: ImageAspect | null | undefined): string {
  switch (value) {
    case "landscape":
      return "aspect-[3/2]";
    case "portrait":
      return "aspect-[3/4]";
    case "square":
    default:
      return "aspect-square";
  }
}

/** Valeurs pour `next/image` width/height (mêmes proportions que aspectClass). */
export function imageDims(value: ImageAspect | null | undefined): {
  width: number;
  height: number;
} {
  switch (value) {
    case "landscape":
      return { width: 1200, height: 800 };
    case "portrait":
      return { width: 900, height: 1200 };
    case "square":
    default:
      return { width: 1000, height: 1000 };
  }
}

export function normalizeAspect(input: unknown): ImageAspect {
  if (input === "landscape" || input === "portrait") return input;
  return "square";
}
