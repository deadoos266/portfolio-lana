import { getSetting } from "@/lib/settings";

export type BlockWidth = "narrow" | "normal" | "wide" | "full";
export type BlockAlign = "left" | "center";

export interface SectionLayout {
  width: BlockWidth;
  align: BlockAlign;
}

export const WIDTH_OPTIONS: ReadonlyArray<{
  value: BlockWidth;
  label: string;
}> = [
  { value: "narrow", label: "Étroit" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Large" },
  { value: "full", label: "Pleine largeur" },
];

export const ALIGN_OPTIONS: ReadonlyArray<{
  value: BlockAlign;
  label: string;
}> = [
  { value: "left", label: "Aligné à gauche (comme le titre)" },
  { value: "center", label: "Centré" },
];

/** Classe Tailwind correspondant à la largeur choisie. */
export function widthClass(width: BlockWidth): string {
  switch (width) {
    case "narrow":
      return "max-w-2xl";
    case "normal":
      return "max-w-3xl";
    case "wide":
      return "max-w-4xl";
    case "full":
    default:
      return "";
  }
}

/** Classe Tailwind correspondant à l'alignement horizontal du bloc. */
export function alignClass(align: BlockAlign): string {
  return align === "center" ? "mx-auto" : "";
}

function readWidth(value: string | null | undefined): BlockWidth {
  const valid: ReadonlyArray<BlockWidth> = [
    "narrow",
    "normal",
    "wide",
    "full",
  ];
  return valid.includes(value as BlockWidth)
    ? (value as BlockWidth)
    : "full";
}

function readAlign(value: string | null | undefined): BlockAlign {
  return value === "center" ? "center" : "left";
}

export async function getProjetLayout(): Promise<SectionLayout> {
  const [w, a] = await Promise.all([
    getSetting("projet_width"),
    getSetting("projet_align"),
  ]);
  return { width: readWidth(w), align: readAlign(a) };
}

export async function getVisionLayout(): Promise<SectionLayout> {
  const [w, a] = await Promise.all([
    getSetting("vision_width"),
    getSetting("vision_align"),
  ]);
  return { width: readWidth(w), align: readAlign(a) };
}
