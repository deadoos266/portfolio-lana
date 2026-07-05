"use client";

import { useMemo, useState, useTransition } from "react";
import {
  FONT_LIBRARY,
  FONT_SLOTS,
  getFont,
  googleFontsUrl,
  type FontCategory,
  type FontDef,
  type FontSlotInfo,
  type SiteFonts,
} from "@/lib/fonts";
import { saveFontsAction, resetFontsAction } from "./actions";

const CATEGORIES: ReadonlyArray<FontCategory> = [
  "Serif classique",
  "Serif display",
  "Sans-serif",
  "Manuscrite",
  "Display / Impact",
  "Machine à écrire",
];

interface FontsFormProps {
  initialFonts: SiteFonts;
}

export function FontsForm({ initialFonts }: FontsFormProps) {
  const [values, setValues] = useState<SiteFonts>(initialFonts);
  const [isSaving, startSave] = useTransition();
  const [isResetting, startReset] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Précharge dynamiquement TOUTES les polices Google Fonts pour la preview.
  const previewFontsHref = useMemo(() => {
    const allFontsPseudoState: SiteFonts = FONT_LIBRARY.reduce<SiteFonts>(
      (acc, f, i) => {
        const slotKey = FONT_SLOTS[i % FONT_SLOTS.length].key;
        acc[slotKey] = f.slug;
        return acc;
      },
      { ...initialFonts },
    );
    return googleFontsUrl(allFontsPseudoState);
  }, [initialFonts]);

  function updateFont(key: keyof SiteFonts, slug: string) {
    setValues((prev) => ({ ...prev, [key]: slug }));
  }

  function handleSave() {
    const formData = new FormData();
    for (const slot of FONT_SLOTS) formData.set(slot.key, values[slot.key]);
    startSave(async () => {
      await saveFontsAction(formData);
      setSavedAt(Date.now());
    });
  }

  function handleReset() {
    startReset(async () => {
      await resetFontsAction();
      window.location.reload();
    });
  }

  return (
    <>
      {/* Charge toutes les polices Google pour l'aperçu */}
      {previewFontsHref && (
        // eslint-disable-next-line @next/next/no-css-tags
        <link rel="stylesheet" href={previewFontsHref} />
      )}

      <div className="space-y-6">
        {FONT_SLOTS.map((slot) => (
          <SlotEditor
            key={slot.key}
            slot={slot}
            currentSlug={values[slot.key]}
            onChange={(slug) => updateFont(slot.key, slug)}
          />
        ))}

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? "…" : "Enregistrer les polices"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline disabled:opacity-50"
          >
            Revenir aux polices d&apos;origine
          </button>
          {savedAt && !isSaving && (
            <span className="text-sm text-emerald-600">
              ✓ Enregistré — rafraîchis ton site (Ctrl + Maj + R)
            </span>
          )}
        </div>
      </div>
    </>
  );
}

interface SlotEditorProps {
  slot: FontSlotInfo;
  currentSlug: string;
  onChange: (slug: string) => void;
}

function SlotEditor({ slot, currentSlug, onChange }: SlotEditorProps) {
  const [openCategory, setOpenCategory] = useState<FontCategory | null>(null);
  const currentFont = getFont(currentSlug);

  return (
    <section className="card p-6">
      {/* En-tête : nom + description + preview de la police actuelle */}
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {slot.label}
        </div>
        <div className="mt-0.5 text-xs text-zinc-500">{slot.description}</div>
      </div>

      <div
        className="mb-5 min-h-[3rem] rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-3 text-2xl leading-tight text-zinc-900"
        style={{ fontFamily: currentFont.family }}
      >
        {slot.preview}
      </div>
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium">
          Actuelle : {currentFont.name}
        </span>
        <span className="text-zinc-400">{currentFont.category}</span>
      </div>

      {/* Sélection par catégorie */}
      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const isOpen = openCategory === cat;
          const fontsInCat = FONT_LIBRARY.filter((f) => f.category === cat);
          const hasSelected = fontsInCat.some((f) => f.slug === currentSlug);

          return (
            <div key={cat} className="rounded-lg border border-zinc-100">
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? null : cat)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium transition ${
                  hasSelected ? "text-zinc-900" : "text-zinc-600"
                } hover:bg-zinc-50`}
              >
                <span className="flex items-center gap-2">
                  {cat}
                  {hasSelected && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ✓
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    ({fontsInCat.length})
                  </span>
                </span>
                <span className="text-zinc-400 transition" style={{ transform: isOpen ? "rotate(90deg)" : "" }}>
                  ›
                </span>
              </button>
              {isOpen && (
                <div className="grid gap-2 border-t border-zinc-100 p-3 sm:grid-cols-2">
                  {fontsInCat.map((f) => (
                    <FontOption
                      key={f.slug}
                      font={f}
                      preview={slot.preview}
                      selected={f.slug === currentSlug}
                      onSelect={() => onChange(f.slug)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface FontOptionProps {
  font: FontDef;
  preview: string;
  selected: boolean;
  onSelect: () => void;
}

function FontOption({ font, preview, selected, onSelect }: FontOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition ${
        selected
          ? "border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900/10"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <span
        className="line-clamp-1 text-xl text-zinc-900"
        style={{ fontFamily: font.family }}
      >
        {preview}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {font.name}
      </span>
    </button>
  );
}
